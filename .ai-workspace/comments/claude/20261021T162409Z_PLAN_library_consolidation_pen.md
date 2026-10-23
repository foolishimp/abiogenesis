# Plan: apply the library design and close the T-287 library deliverable

Status: commentary; the pen's working ledger. Author: Claude. Subject:
abiogenesis `main` at `2e74fcd8c` (clean; Codex stood down 2026-10-22).
Design source: post `20261021T135156Z_REVIEW_compute_calculus_and_library_design.md`
(Parts B1 to B13). Scope: the T-287 library deliverable only: accepted design,
usable common implementations, retirements, proofs. Release work (fifteen-family
lifecycle, F11, qualification, RC1) stays outside and resumes after step 8.

## Pen rules

- Roles follow the project basis
  (`design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`, "Executive, Writer, And
  Reviewer Binding") and the released `EXECUTIVE_BASELINE.md` §5, §6, §8, §9.
  The Executive performs no source, design or ticket-body mutation. Workers
  hold the Writer grant per step. Reviewers evaluate a frozen commit and do
  not edit. See "Execution configuration".
- One step at a time. One commit per step on `main`, no push unless Jim says.
  A blocking review finding gets one bounded repair commit; a second failure
  reverts the step's commits and stops for re-entry with Jim. The steel
  thread is green at every commit on `main`.
- One-line status at each step close: step, commit, gate result, sites
  retired, agents used. No other reporting.
- No Codex readers. Change class per step is declared below. No constitution
  amendment: §5.6.1 and §5.6.2C are untouched; the design realizes them.

## Execution configuration (added 2026-10-22 at Jim's request)

**Executive: Claude Fable, this session.** Three duties per step
(`EXECUTIVE_BASELINE.md` §6): select the smallest dependency-ready frame set,
write one reconstructable activation, consume the closed return and the closed
review, triage, dispose, choose the next already-authorized action. The
Executive writes only activations, dispositions, the ledger and posts. It
does not re-run gates: the Worker's gate output in the return is the
evidence, and the step 8 review re-executes the full suite once. It reads
returns and reviews, not diffs; the whole diff is read once, at step 8.
Recorded same-actor Writer transition, standing for this plan: the Executive
writes the plan post, the step files and this ledger, and commits those
commentary surfaces at checkpoints; nothing else. Step 0's build was a
worktree mutation by the Executive (eleven tracked build outputs and four
generated digests changed); it was reverted, and from step 2 on every build
is a Worker effect inside its grant.

**Worker: Opus 5.5 at xhigh effort, fresh agent, one at a time.** Writer grant
per step: the files, retirements and gate named in that step; commits on
`main` with the step's message; returns changed paths, gate output, residuals
and the return route. A Worker does not widen the step, does not read Codex
material beyond what the activation names, and does not read reviewer
transcripts, only the review file.

**Reviewer: at max effort, fresh agent, over the frozen commit by hash, at
steps 1, 6, 7 and 8 only.** Returns findings with technical severity (`S0`
to `S4`) and triage, each with chaseable evidence (file and line, command,
output). Priority (`P0` to `P5`) and boundary effect are the Executive's,
assigned at disposition (project basis, "Executive, Writer, And Reviewer
Binding"). Step 1 is reviewed by Opus 5.5, because
the Executive authored the design and a Fable reading would not be
independent of it. Steps 6, 7 and the step 8 whole diff are reviewed by
Fable: the design reframe and the two highest-risk realizations. Steps 2 to
5 are not reviewed. They are proved by their gates (build, lint, unit tests,
the P-EQUAL, P-INGRESS, P-KEYS, P-SELECT and P-RECORD property tests), and
the step 8 review covers their diff once. This follows the owner's control
that review findings inform priority and do not open a review campaign, and
the ACTIVATION §6 rule that a review which removes no ambiguity is cost.

**Independence, disclosed per review file.** Every reviewer is a fresh
context that never held the Worker's or the Executive's context, over a
subject frozen by commit hash (installed EVALUATION: assessment binds a frozen
subject; independence rests on authorship). All actors are one vendor family;
each review file says so. Forks are never used for Workers or Reviewers: a
fork inherits the Executive's context, which breaks both independence and
the attention bound.

**Tool mechanics.** The Agent tool takes `model: "opus"` or `"fable"` and
`effort: "xhigh"` or `"max"`; `"opus"` resolves to the environment's current
Opus, which is 5.5 here, and cannot pin a version string. Agents run in the
background and return a report; the report is not the result. The return
file is.

**Per-step cycle** (the activation relation in the project basis). One file
per step,
`.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-<n>.md`,
with sections `Activation`, `Return`, `Review` (reviewed steps) and
`Disposition`. No separate receipts.

1. Executive writes `Activation`: role and outcome, subject and frame set,
   hard constraints, evidence and source routes (this plan's step, the design
   post's sections, files, gate), open solution space, return and stop
   contract, `ACTION` last.
2. Worker commits and appends `Return`: commit hash, changed paths, gate
   command and output, residuals.
3. Reviewed steps: Reviewer appends `Review` over the commit hash.
4. Executive assigns priority and disposes. `P0` to `P2`: one bounded repair
   activation to a fresh Worker carrying the review and the commit hash, never a message to the
   finished Worker (a continuation re-reads its whole transcript); the repair
   commit is re-reviewed on the blocking findings only. `P3` to `P5`: ledger,
   no repair, no re-review. A still-blocking finding after one repair round
   reverts the step and stops for re-entry with Jim.
5. Executive appends the one-line `Disposition` and the ledger row; next step.

**Churn controls.** One repair round per reviewed step. No re-review of `P3`
to `P5`. Freeze by commit hash only; no whole-file preimage copies, no
gate-output digests. Sequential: at most one agent live at a time, Worker then Reviewer;
parallel Workers are not planned because the steps are dependency-ordered.

**Testing cadence.** The steel thread is `npm run build` (the structural
gate) plus `test:installed:language`, the Hello World program through
installed Public execution and fresh reads: the product's own A5-F14 path.
It is the gate of every step. Unit evidence is added only where a step
introduces an irreducible atom (constitution SP-05, SP-06): equality at
step 4, exact match and checked record at step 5, the fold at step 6. A
changed owner seam gets one focused integration scenario with its material
negative, at step 7. Broad suites and stable-atom reruns run once, as one
deduplicated invocation at step 8, the integrated qualification boundary (SP-06; EXECUTIVE_BASELINE §8: substantial cycles
near the boundary, focused regression during construction). A step 8
failure returns to the first violated seam (SP-09) and authorizes no test
expansion. Sources: released ACTIVATION §6 and §7 (cheapest focused proof;
the method's own evidence serves an identified need, repetition supplies no
validity), EXECUTIVE_BASELINE §8 and §9 item 15, ASSURANCE §7, §8 and §15,
DESIGN_MODULE "Evidence remains proportional to semantic change and risk",
SPEC_METHOD §8, and the constitution's SP-05 to SP-09.

**Frame sets.** All steps: `f-law`, `f-checks`, `f-claim`; reviews add
`f-review`; steps 6 and 7 add `f-worksite-causality`; step 7 adds
`f-end-to-end-interface-integration`. Derived Worker frame:
`EXECUTIVE_BASELINE.md` §9. Derived Executive frame with steel-thread
delivery: §8.

**Agents, planned.** Eight Workers (steps 1 to 8). Four Reviewers (steps 1,
6, 7, 8). At most one repair Worker and one re-review per reviewed step.
Step 0: none; the Executive runs the baseline itself. Twelve to twenty agent
runs in all.

## Decisions Jim owns

Answer in one message. Steps 2 to 5 proceed under the recommended defaults on
"go"; they are `realization_refactor` and each reverts alone.

| Id | Decision | Recommendation | Blocks |
|---|---|---|---|
| D0 | Withdraw the cross-consumer handoff that Root's conjunction decision (`realization/common-consolidation-conjunction-01/decision.md`, row "Cross-consumer handoff") accepted as bounded DESIGN. Replacement: B14 (the corrected invariant and the refusal route). | Withdraw, once the design carries B14; held until the step 1 repair commit. | step 1 repair |
| D1 | `ROOT_DERIVED_RULES` as the carrier of contextual Event Calculus effects (realizes the IACS's `RuntimeDerivedFluentRule`). | Yes. | step 6 |
| D2 | `checkExactRecord` digest leg runs after projection (`expected(event, value)`), not before. | After projection; the signature already says so. | step 5 |
| D3 | The two "native composite classifications" (O-TYPE) are ingress questions answered by `admitContract`, not an `encode` parameter on equality. | Yes, per site: each is decided when its ingress site is touched (steps 3 and 4) and recorded in that step's Return; no blanket closure. | steps 3, 4 |
| D4 | Throwing `i_json` API: keep as a thin lift over `admitJson` through step 7, retire at step 8. | Keep then retire. | step 3, step 8 |
| D5 | Retire `terminationConfirmed` from event payloads via a new root event profile. The store recognizes exactly two digests (`event_store.ts:1189`) and reopening rejects any other stamp (`:3608`), so a third profile needs validators, transitions and fresh-process reopening: a recovery obligation of its own. Alternative: keep the field; the lifecycle rule derives the fluent and checks the copied field against it at fold time; retirement recorded for the next profile change. | The alternative (B14). Jim was told of this change on 2026-10-22 and answered "ok go"; override before step 7 if the migration is wanted now. | step 7 |
| D6 (Executive, 2026-10-22, during step 2) | Where the `binding` family lives. The first step 2 Worker stopped: `admitExactDefinitionCall` reads the instantiated Public function family by value (digests range over all thirteen owner contract tables), so no cut leaves `shared/` without an upward import. Decided as a `design_reframe` under the pen: `public/binding/` above the owner contract tables (`owner_contract_source_set`, `public_function_family`, `public_function_projections`, `definition_binding_mechanics`, `static_definition_bindings` move there; `effect_definition.ts` stays in `shared/`). The alternative, call admission not reading the family, is a semantic change and was refused. Jim can reverse this in the morning; it is one directory move. | decided |
| D7 (Executive, 2026-10-22, during step 6; trace corrected by the step 6 review) | The replay state witness. `replay.ts:1387` digests the held fluent set into `replayStateDigest` (route and judgment payloads) and `sourceReplayDigest` (invocation source basis). The step 6 lifecycle rule and its new fluent move that digest at every cut after an actor process event, so the Worker stopped (profile-change stop). Ruling: the witness is computed under the law in force when a route or judgment is proposed; every comparison in `code/src` (`traversal_route.ts:4438`, `:5371`; `c_call.ts:7047`) is between values computed in the same transaction under the same law, and no path compares a stored witness with a recomputation (the Executive's first trace wrongly called `:5371` stored-versus-recomputed; the Fable review corrected it). History reopens unchanged after the law change; no prior law is kept alive (constitution §4.1). Not an event-profile change. Reversal: revert the step 6 commit and its repair. | decided |
| D8 (Executive, 2026-10-23, after the step 7 review) | Transport artifacts recorded before step 7 carry no `processFacts`. Reconstruction (`worksite_construction_recovery.ts:64-70`) reads an absent member as "facts not recorded" and decides on the exit members it already compares (`status`, `signal`, `exitObserved`) and on the `actor_process_terminated` fluent; a present member is verified in full. Reason: unlike D7, a stored artifact is re-read under the new requirement, and the tracked Product proof over a real store (`d1-preserved-result.test.mjs`, 1891 events) would otherwise fail or need its preimage re-cut; no admitted truth is lost either way. Not built: a separate demonstration of recovery from a pre-change artifact; the D1 test is that demonstration where its preimage exists. Reversal: delete the one line and re-cut the D1 preimage. Flagged for Jim with D6 and D7. | decided | none |
| D9 (Executive, 2026-10-23, after step 8a; reversed by the Executive after the whole-diff review the same day) | An `actor_process_exited` after an `actor_process_termination_unconfirmed` for the same process initiates no `actor_process_terminated` (the step 6 rule's guard stands). Reason: the exit event carries no scope evidence; the unconfirmed verdict is about the owned scope (§4.6); the owner reports one terminal event, so the sequence occurs only in prior-law stores. `m5-terminal-quiescence-owner` encoded the pre-step-6 law at `:162`, `:166-167`, `:222`; its expectations follow the ratified law (8a-2). Reversed in the step 8 repair: the Reviewer showed the exit event's kind is the owner's scope evidence (§4.6, §9.2), no emitter produces the two-terminal sequence, and §4.4 states the rule without the guard; the guard is dropped, the late-exit expectation restored, row 5 restated. Flagged for Jim as a reversal. | reversed | none |
| D10 (Executive, 2026-10-23, after the post-close review) | O-SCHEMA at the raw owner boundary: the three raw dispatches of `product/semantics.ts` (`admitInstalledProductInput`, `evaluateInstalledInteractionResponse`, the leaf `validateContractValue`) admit through `admitJson` before the provider's guard; a refusal takes the method's existing channel (the third dispatch ratified after repair A's census, 2026-10-23). Reason: the 8b closure premise ("reached only with parsed I-JSON") was false at the provider API (`product/builtin_semantics.ts:1050`), shown by the review's in-memory probe. Reversal: delete the admission lines and reopen O-SCHEMA. | decided | post-close repair A |
| D11 (Jim, 2026-10-23, after the post-close review) | O-TYPE at the step 4 cast sites (about 65 `unknown`-typed comparands among 867 `JsonValue` casts), the binding `sameJson` lift, the `hog/parent_rehydration.ts` carrier site, the `jsonRecord` consumers and the consensus guard-refined comparisons and relation evaluators: discharge now or carry as recorded debt. The plan's completion condition forbids closing with them open. | Discharge, by one census activation (producer named per site; a value typed upstream loses its cast; otherwise `admitJson` at the site on its own refusal channel), the 8a-2 pattern. Jim: "the answer is always remove tech debt". | post-close repair C |
| D12 (Executive, 2026-10-23, after repair C; rule tightened the same day after the fourth review; restated after repair B to the rule as realized) | `admitJson` admits a plain record or array of any realm by structure. A record's prototype is `null` or a realm's `Object.prototype`; an array's prototype is a realm's `Array.prototype`. A prototype is a realm's `Object.prototype` when it is this realm's, or when its own prototype is `null` and its own data `constructor` is a function named `Object` whose own data `prototype` is that same object; a realm's `Array.prototype` is this realm's, or an array whose own data `constructor` is a function named `Array` whose own data `prototype` is that same object, with such an `Object.prototype` above it. No getter runs. Every other prototype is refused: a class instance, an `Array` subclass instance, an accessor `constructor`, an array whose prototype is a plain array (`Object.setPrototypeOf([1], [9])`), a null-prototype object carrying a `constructor` named `Object` (the fourth review's probes), and `new (function Object(){})()`, whose prototype sits above this realm's `Object.prototype` (repair B's probe; the row at `2f1393061` admitted it, the realization refuses it, and the realization stands). Admission copies own data into ordinary containers, so a prototype confers nothing. Reason: `code/src` loads no second realm (no `node:vm`), the test lanes do, and the atom's domain is I-JSON structure; prototype identity over-refused four qualification comparisons (repair C `stop: channel`), and until then every (A) site refused a record of another realm that `0c362da15` compared by structure. Reversal: restore the identity checks in `shared/admit/json.ts` and the four casts. | decided | post-close repair B (`d8cf6b5d9`) |
| D13 (Executive, 2026-10-23, after repair C) | At the four result-event lookups inside `catch { return false; }` (`abg/semantic_job.ts` `validateWorksiteFileParentsPlanAtPrefix`; `abg/semantic_revision.ts` `semanticJobRevisionInputMatchesBasis`, `semanticRevisionInputMatchesBasis`; `abg/worksite_construction_recovery.ts` `nativeWorksiteRecoverySourceAtPrefix`), a `c_call_result_admitted` event without `value` is not a candidate. Reason: the payload contract allows the member absent (repair C; `event_body_encoding.ts:23` names a body encoding for the kind's value); at head one such event beside the match answered `false` for the whole lookup through a thrown TypeError caught as `false`, which is neither the owner's fault nor its answer. Reversal: restore `presentMember` at the four sites. | decided | post-close repair B |
| D14 (raised by repair C, 2026-10-23; taken on the fourth review Jim forwarded the same day, with its corrections) | The five lifecycle failure subjects (`hog/recursion_lifecycle.ts:570`, `:1027`, `:1053`; `hog/workflow_lifecycle.ts:727`, `:1075`) pass the admitted transition, which carries the owned runtime prefix object, as the failure's candidate (`recursionFailure`, `failWorkflow` to `failTraversal`'s `{ stage, candidate }` subject); the canonical writer encodes the prefix's `RuntimeHistorySelection` instance as `{}`. Corrected rationale: the subject digest already binds the selected history through `replayState.eventStoreDigest`, count, ordinal and the durable successor coordinate, so the `{}` member is a content defect, not a lost commitment; and the five routes record a subject digest and a `diagnostic://` class URI without retaining the subject bytes (cold projection: `not_retained`, subject `null`), so this change retains nothing. Decision: a prospective representation change. The subject carries a typed JSON projection of the transition in which the prefix member is the outcome's own full durable coordinate, Run selector and selected-event digest, count and ordinal, taken from the outcome's own cut (a nested outcome keeps its earlier cut, not the later transition prefix); event payload keys, historical bytes and digests unchanged; no retention claim. Evidence: all five projections, both the recursion and the workflow admission path, two distinct selections over one physical prefix giving distinct subject digests, an outcome's earlier cut preserved. Reversal: restore the five casts. | taken | post-close repair D |
| D15 (Executive, 2026-10-23, after repair B stopped its helper handoff on the contract rule) | The helper route's failure facts reach `L` as §9.3 item 4 and §10.6 row 6 (`:654`, ratified at step 7) state: through the admitted leaf failure's diagnostic subject, with no Product output contract change. Realization: the helper publishes a post-launch failure as the artifact's `failure` disposition (one member, `failure`, the subject with the facts as encoded at the throw site; other dispositions' bytes unchanged); the parent's `helper_failure` candidate carries the admitted subject inline as its diagnostic reference (`constructRuntimeFailureDiagnosticRef`, the §9.3 item 3 mechanism) in `diagnosticRef` and `resultCandidate.diagnosticRef`; `isWorksiteCommandExecutionFailure`'s member set is unchanged. Repair B's delta part 2 (a `subject` member on the Product failure value) is refused: row 6 says no Product output contract changes. Reason: the design already selected the subject route and the inline mechanism exists (`runtime_failure.ts:84`, `:89`); the alternative widens an accepted shape to carry what a reference already can. Acceptance: an admitted `c_call_result_admitted` whose failure value's reference decodes cold to the subject with the original cause and the helper child's own facts. Reversal: the `subject` member, a Product output contract change for Jim; or the class reference restored and the helper-route obligation reopened. | decided | post-close repair D |
| D15 as realized (Executive, 2026-10-24, after the fifth review and repair E `280f5777f`) | The helper prints its acknowledgment of the published artifact for every disposition and drains the write before its non-zero exit; the renderer's instruction states that a non-zero helper exit after its acknowledgment is an observation, and the worker returns the acknowledgment unchanged; the parent accepts only a successful transport, binds the acknowledgment's `helperArtifactRef` and `helperArtifactDigest` to the artifact before it reads the disposition (`result_contract_failure` otherwise), and on the `failure` disposition carries the admitted subject inline (repair D's mechanism). The installed case drives the route from the helper's exit through a controlled worker relaying its stdout. | taken; the owner can reverse the instruction sentence (delete it, refresh the C2 pin) or the binding (one `if` in the parent's completion) | none |

## Steps

### Step 0. Ground

Commit the two review posts and this plan. At `2e74fcd8c` run `npm run build`
and `npm run test:installed:language` once; confirm the smoke runs from the
packed install and record its wall time. That pair is the steel thread for
every later step. No broad suite runs here. Output: baseline commit, ledger
line.

### Step 1. Design re-entry (`design_reframe`)

Files:
- `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`:
  replace the K01 to K12 catalog with the six operator-family modules and
  dependency direction (B2), the `Outcome` carrier (B3), composition laws (B4),
  Prime atoms with falsifiers (B5), IACS table (B6), three accounts (B7), three
  views (B8), retirement table (B9 as amended), proofs and decisions (B10), and
  the event-log recovery invariant (B13) stated as a library law.
- `ABI5_STDO3_COMPUTATIONAL_BINDING.md` §4: the eight operator classes are
  exported function signatures; the sentence "classifications, not a
  sufficient library specification" goes.
- `ABG_EVENT_CALCULUS_IACS.md`: `RuntimeDerivedFluentRule` realized as
  `DerivedEffectRule` and `ROOT_DERIVED_RULES`; `holdsAt` the prime reader.
- `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`:
  new section "STDO 3 library re-entry (2026-10-22)": change class, D0
  withdrawal, D1 to D5 answers, step ledger, the held-suspension follow-up.
- `specification/GOALS.md` GOAL-035 row: the sentence that cites the
  conjunction acceptance is refreshed to cite this re-entry. Jim's surface;
  drafted under his go-ahead.

Gate: the three views agree on carriers (B8 check); every atom has a
falsifier. No code moves, so no test runs. Commit.

Repair before review: the Worker transcribed B13 before the former
Executive's review of the plan (2026-10-22) showed B13's invariant
overstated and its route wrong. A fresh Worker carries B14 into the design
document, the IACS, the ticket section and the GOALS sentence: the three
layers (observation, admission, derived state), the refusal route through
`refuseActorProcessEffect`, the facts encoding, D5 as the alternative, D3
per site, D0 withdrawn on that basis. The Opus review runs over the repaired
commit.

### Step 2. Carrier and layering (`realization_refactor`)

Add `shared/refusal.ts` (`StructuralRefusal`, `Outcome`, `ok`, `refused`,
`then`). Move `product/exact_match.ts` to `shared/select/exact_match.ts` with a
re-export at the old path until step 5. Move `bindExactPrefixRead` and
`bindExactPrefixTransition` from `shared/static_definition_bindings.ts` to
`abg/exact_prefix_bindings.ts`. Move `shared/owner_contract_source_set.ts` to
`public/`. Add an import-direction rule to `scripts/lint-verification.mjs`:
`shared/` imports only `shared/`. Sites: 4 moves, about 20 import lines.

Gate: steel thread, plus `npm run lint` once for the new import-direction
rule. Commit.

### Step 3. Admit family (`realization_refactor`, D3, D4)

`shared/admit/`: `isRecord`, `hasExactKeys`, `admitJson`, `admitContract`,
`admitRef`. Retire the 5 NUL-joined bodies in `shared/admission_predicates.ts`,
the second `isRecord`, the inline shape guards as touched (32 known), and the
inlined `v.safeParse` in `bindStaticOwner`. `i_json` throwing entry becomes a
lift over `admitJson` (D4).

Owner obligations closed in this step's Return, each with its site list:
O-RESOURCE (`definition_binding_mechanics.requiredSlot` and
`exactContractCoordinate` take `unknown`; they consume `admitRef` and
`admitContract`), O-SHAPE (the 38 local guards and seven `isJsonRecordShape`
consumers), O-SCHEMA (`product/default_library.jsonRecord` and
`abg/project_read_definition_bindings.asRecord` replaced by `admitContract`),
O-KEY (the five NUL-joined bodies and the private `exactKeys` at
`product/default_library.ts:117` replaced by `hasExactKeys`; exact owner
shape, not legacy collision), O-CODEC (`decodeEventBody` keeps returning an
unknown restored event for later event-store validation; `admitJson` does not
move semantic admission earlier). D3 sites touched here are decided and
recorded.

Gate: steel thread. No unit lane: these atoms are thin wrappers over the
JSON parser and the schema library (SP-05). P-INGRESS and P-KEYS are
established at step 8 by the integrated run. Commit.

### Step 4. Value family (`realization_refactor`)

`shared/value/`: `canonicalEquals(JsonValue, JsonValue)`, `writeCanonicalRecord`,
`sha256Canonical`, `sha256Bytes`, `deepFreeze`, `isDeeplyFrozen`. Retire the 12
`sameCanonical*` copies (including `hog/parent_rehydration.ts:62`), the 39
inline comparisons, the 3 hand-rolled writers. The C2 path keeps its truthful
materialization (`abg/execution_basis.ts:800` materializes the event-body
view before comparison); `canonicalEquals` takes the materialized `JsonValue`,
and an unmaterialized view (custom prototype) is refused at ingress
(`shared/i_json.ts:141`). `c_call.ts` carries most sites. O-TYPE sites
touched here are decided per D3 and recorded in Return.

Gate: steel thread, plus one focused unit lane for the new irreducible atom:
P-EQUAL positive (materialized bodies compare equal to the durable read and
the C2 reuse proceeds) and negative (the wrong carrier is refused). Commit.

### Step 5. Select family (`realization_refactor`, D2)

`shared/select/`: `onlyExactMatch`, `exactMatchOutcome`, `checkExactRecord<E,P>`,
`exactMatchCardinality`. The Worker first censuses which of the 213
`length === 1` sites realize `select` and which of the 74 readers re-implement
one algorithm, then retires the 2 local `one()`, the 13 C3 helpers and those
sites. Drop the `product/exact_match`
re-export.

Gate: steel thread, plus one focused unit lane: P-SELECT and P-RECORD over
`onlyExactMatch` and `checkExactRecord`. Commit.

### Step 6. Calculus fold and rule table (`design_reframe`, D1)

`abg/calculus/`: `FoldState`, `HoldsAt`, `DerivedEffectRule`, `effectOf`,
`foldStep`, `holdsAt`, `ROOT_DERIVED_RULES` with four rules: terminal Run
census (`event_calculus.ts:1908` to `1951`), per-process cleanup (`1952` to
`1974`), liveness (`1888`), `actor_process_lifecycle` (Codex's C1 as a rule).
`advance` (`1880`) rewritten over `foldStep`; `RuntimeEventCalculusDerivation`
stays as the memoized realization with `forkAt`. `actor_process.ts`,
`replay.ts`, `runtime_liveness.ts` read `holdsAt`. Highest-risk step; one
commit, reverted whole if the gate fails.

Gate: steel thread, plus one focused unit lane for the fold: P-FOLD (cold
replay equals warm fold on one recorded store) and the two decision-exact
falsifiers, counterexamples A (`actor_process.ts:631`) and B
(`event_calculus.ts:1909`). The calculus suites wait for step 8. Commit.

### Step 7. Lifecycle failure carrier and projection (`realization_refactor`, D5)

Replaces the withdrawn step 6 of the design; route per B14.
1. The owner reports one of three process terminal events from the facts
   inside `onProcessFinalized` (`actor_process.ts:1312-1328`); those events
   are in `L` on both paths and drive the lifecycle rule. The reporting
   choice is `hasConfirmedOwnedProcessBoundary(facts)` in `shared/process/`,
   used by the actor and by the helper's command and HTTP adapters (today two
   formulas: `worker_transport.ts:461`, `worksite_command_helper.ts:769`).
   The actor's outer catch (`actor_process.ts:1403`) builds its refusal from
   the message alone: `refuseActorProcessEffect` now sets `diagnosticRef` to
   `constructRuntimeFailureDiagnosticRef(encodeOwnedProcessFacts(facts))`
   so `admitRuntimeFailure` retains the encoded facts inline
   (`runtime_failure.ts:84`, `:100-105`). The refusal reaches `failCCall`
   (`ccall_lifecycle.ts:541`) and `failTraversal` admits it. If
   `admitRuntimeFailure` itself throws, the facts are lost with the Run's
   failure and the physical state stays unknown; nothing is written beside
   the log. Command and HTTP facts enter `L` as members of the admitted leaf
   result or failure subject; their lifecycle question is answered by
   projecting that admitted event.
2. D5 alternative: `terminationConfirmed` stays in payloads. The
   `actor_process_lifecycle` rule derives the fluent and checks the copied
   field against it at fold time; the 20 known readers switch to `holdsAt`;
   `replay.ts:2444`'s private recomputation goes. No profile change.
3. No `process-failure.json`. `inspectWorksiteCommandExecutionProcessFailure`
   is a projection at the prefix in `product/worksite_command_execution.ts`.
   `task.json`, `launch.json`, `result.json` stay as spawn-boundary transport.

Gate: steel thread, plus one focused integration scenario at the changed
seam with its two material negatives: a no-child launch failure, and an
error after launch with unresolved cleanup (`scopeAbsence` not `"absent"`,
`firstError` set). Each yields the admitted refusal with the encoded facts
and the same answer derived from `L` on worker (fluent via `holdsAt`),
command and HTTP (the admitted result or failure subject), with no file
read (P-LIFECYCLE whole path; SP-06). The lifecycle suites wait for step 8.
Commit.

### Step 8. Close

- D4 retirement of the throwing `i_json` entry, only where the affected
  caller contracts are demonstrated in this step's Return; otherwise the
  bridge stays and the remainder is recorded.
- Completion condition: O-RESOURCE, O-SHAPE, O-CODEC, O-SCHEMA and O-KEY are
  closed in step 3's Return and O-TYPE per site in steps 3 and 4; the
  library does not close with any of them open.
- Lint rule for the B13 invariant: no lifecycle boolean computed or copied
  outside `abg/calculus/` (the `holdsAt` falsifier as a check).
- The integrated run, once, as one deduplicated `node --test` invocation
  after `npm run build` (the `test:unit`, `test:m5` and lifecycle lists
  overlap; each file appears once): `m5-c-algebra-validation`,
  `t287-c2a-fp-source-contract`, `m5-installed-graph-edge`,
  `m5-worker-transport`, `m5-event-store-reopen`, `m5-event-calculus-runtime`,
  `m5-retry-lifecycle-authority`, `m5-s03-authority`, `m5-consensus-module`,
  `m5-s06-prime`, `m5-installed-portability`, `m5-terminal-quiescence-owner`,
  `m5-fresh-process-reconstruction`, `t287-native-structural-gates`,
  `t287-native-runtime-gate`, `forward-command-contracts`,
  `forward-command-owners`, `t287-native-semantic-revision`,
  `t287-owned-process-lifetime`, `t287-event-calculus-owner-continuation`,
  `t287-calculus-state-transfer`, `t287-reconstruction-conservation`,
  `t287-ordered-reconstruction`, `t287-worksite-command-execution`,
  `t287-observed-worksite-command`, `t287-runtime-activity-quiescence`,
  `t287-generic-job-lifecycle`, `t287-common-computational-library`, then
  `test:uat:harness`. The step 8 Reviewer reads that run's output and reruns
  only a suite a finding names, for the uncertainty it resolves. A failure
  returns to the first violated seam (SP-09); bisection over the eight step
  commits localizes it; no test expansion.
- One independent review of the whole diff against the post's proofs
  (P-EQUAL to P-LAYER plus P-LIFECYCLE whole path), same-family disclosed.
- Closing post; T-287 ledger section closed for the library deliverable;
  GOAL-035 row refreshed. Hand back for release work.

## Outside this plan

- `HeldWorkflowSuspension`, `HeldRecursionSuspension` and
  `rehydrateParentReturnFrames` hold parent state in caller memory across a
  hold (B13 second instance). Logged in T-287 as a follow-up with its own
  re-entry; untraced fields `application` and `sourceCursor`.
- Release integration, F11, qualification, RC1.

## Ledger

Baseline attribution (Executive, 2026-10-22 night): `test:unit` at the pre-code step 1 commit `97b1200bc`, built fresh in a scratchpad worktree (`tsc` clean; the manifest generator failed only on the worktree's symlinked dependencies), is 81 tests: 67 pass, 9 fail, 5 skipped. The nine: `forward-command-owners` (4), `t287-native-runtime-gate` (1), `t287-native-semantic-revision` (4). Suites red at this baseline with the same failure set are baseline failures for the step 8 attribution rule, not seams of this plan.
At the step 4 commit `5f4a1d4c9` (compiled fresh in a second worktree) `test:unit` is 68 pass, 8 fail, 5 skipped; the eight are a strict subset of the baseline nine (the same four `forward-command-owners` and four `t287-native-semantic-revision` cases). The baseline `t287-native-runtime-gate` case at line 121 ("different installed module URLs retain the invoking proof owner") passes after step 4. Steps 2 to 4 introduced no unit failure.
`m5-consensus-module` (in the step 8 list) fails at load on a missing export `ROOT_PUBLIC_OPERATION_IDS` from `public/index.js`; that name exists in `code/src` at no commit from `67c333799` through `98e0257d0`, and the test was last touched on 2026-09-06. Baseline failure.

| Step | Commit | Gate | Retired | Agents | Note |
|---|---|---|---|---|---|
| 0 | `93a4b08df` (posts) | build 34 s pass; `test:installed:language` 46 s, 1/1 pass at `93a4b08df` | none | none | steel thread ≈ 80 s per step; D0–D5 taken at the recommended defaults on Jim's "go" (2026-10-22). The tracked `build/` tree at `2e74fcd8c` was stale against its source: the step 0 build changed 11 files (+357/−149). Reverted after the smoke so step 1 stays design-only; code steps commit the rebuilt outputs with their source. |
| 1 | `44be3cbce` (Worker), `0e89859bf` (repair, B14), `97b1200bc` (repair 2, four S2) | design-only; seven self-checks pass at both commits; Opus max review of `0e89859bf`: No, 4 S2 (facts not in `L` as content; command/HTTP have no lifecycle events; co-evolution overclaimed; caller-supplied axioms vs closed module law), 12 S3, 7 S4; S2 = P1; repair 2 closed all four (facts via reported terminal events plus the refusal retained inline through `failCCall`'s data: reference, ratified in the post; command/HTTP by projection; `U(B)` table §10.6; closed module law), 9 of 12 S3 closed; re-review: S2 2 and 4 closed, S2 1 and 3 partly, no new S2. Accepted with one `P2` narrowed out of the claim: the no-child launch failure's receipt path (`actor_process.ts:1369`) does not carry the facts into `L`; design-gated for step 7 (see step-1.md Disposition 2). D0 withdrawn. Ledgered: 7 S3, 10 S4 across both reviews | K01–K12 catalog, the demotion sentence, Codex C1–C5 as accepted contracts, the file side channel | 3 Workers (Opus xhigh), 2 Reviewers (Opus max) | design doc 429→703 lines, IACS 35→69, ticket +92, GOALS row refreshed; new atom `encodeOwnedProcessFacts` (shared/process) accepted at disposition; D5 attribution recorded in the decisions table |
| 2 | `69132360f` | build 32 s pass; `lint:imports` 0.1 s pass; `test:installed:language` 45 s, 1/1 pass | the three upward imports from `shared/`; `shared/` now imports only `shared/` and packages | 2 Workers (Opus xhigh) | First Worker stopped under stop (a): call admission (`admitExactDefinitionCall`) reads the built Public family by value, so no cut leaves `shared/` clean. Executive `design_reframe` D6: the `binding` family to `public/binding/` (five modules), prefix binders to `abg/exact_prefix_bindings.ts`, `exact_match` to `shared/select/` with a shim until step 5, `shared/refusal.ts`, `scripts/check-import-direction.mjs`; constitution record landed as §16.14 (§16.8 existed). Residuals: `then` export makes the module namespace thenable so `import()` hangs (renamed to `andThen` in step 3); §2 refusal row imports `value` types; move-1 link stale (step 3 fixes both); `ABI5_OWNED_ADMISSION_PREIMAGE` env-gated test path needs a new preimage (step 8 record); tracked build outputs had drifted since `67c333799` and are refreshed here |
| 3 | `a2516dbdc` | build 32 s pass; `lint:imports` pass; `test:installed:language` 45 s, 1/1 pass | 34 NUL-joined exact-key bodies (0 remain); 4 typed record aliases, 6 local and 5 inline record guards; `v.safeParse` in the binders; 29 sites in 21 files on the atoms; 37 alias imports | 1 Worker (Opus xhigh) | `shared/admit/`: `isRecord`, `hasExactKeys`, `admitJson`, `admitContract`, `admitRef`; D4: `admitIJsonValue`/`admitIJsonText` lifted over `admitJson` (identical on 202 inputs). O-RESOURCE, O-SCHEMA, O-KEY, O-CODEC closed with sites; O-SHAPE closed except `abg/retry.ts:663` (cast kept; Executive D3 ruling: `admitJson`, applied in step 4). `andThen` rename and three design fixes done. Residuals to step 8: `isRecordEvidence` and seven local `isJsonRecord` copies outside the touched sites; `jsonRecord` schema still claims `JsonValue` members; `t288-admission-predicates` and `t287-common-computational-library` assert retired names (step 4 rewrites one, deletes the other) |
| 4 | `5f4a1d4c9` | build 32 s pass; `lint:imports` pass; unit lane `t287-value-equality` 4/4; `test:installed:language` 45 s, 1/1 pass | 43 of 44 equality bodies (648 call sites; the binding `sameJson` lift stays); 176 of 178 inline canonical comparisons; 192 both-sides and 156 alias digest comparisons; 32 join sites and 2 join bodies; 2 record-digest copies | 1 Worker (Opus xhigh) | `shared/value/`: `canonicalEquals` (no identity shortcut; encoding failures propagate), `writeCanonicalRecord`, `canonicalRecordDigest` over `JsonRecord`. AST census corrected the activation's grep counts. C2: `.materialize()` kept, both sides through `admitJson`; proof on a test-side copy (production comparison reached by no passing suite; C2 owner-reuse suite red before this step). D3 at `retry.ts` applied (`admitJson`). `t287-common-computational-library` rewritten over the atoms; `t288-admission-predicates` deleted. Flag for Jim: `sameQualificationValue` dropped from the `validator` barrel and the package `"."`/`"./validator"` entries (no in-tree consumer; one line to restore). `test:unit` 68/8/5 and an 11-file e2e set 20/15/7 are red with the same failures at `a2516dbdc`; baseline attribution at `97b1200bc` running. Residuals to step 8 in the step file's Disposition |
| 5 | `10efed8b2` | build 32 s pass; `lint:imports` pass; unit lane `t287-select-family` 7/7; `test:installed:language` 44 s, 1/1 pass | 13 local `one` helpers (the census said 10); 10 of 18 checked-record readers on `checkExactRecord` (8 keep a static `RecordCheck`, §5.6.2C; the reason corrected at the close); 66 of 135 `length === 1` sites in `abg/` (69 are count or arity clauses, 0 first-match); the `product/exact_match.ts` shim | 1 Worker (Opus xhigh) | `shared/select/`: `resolveExactMatch` over `ExactMatchSource`, `exactMatchCardinality`, `onlyExactMatch`, `exactMatchOutcome`, `checkExactRecord`. Each owner keeps its own absent/many mapping. `locateRequired` on the family with the Product split kept. The execution-basis reader the design meant is `invocation_execution_truth.ts:619` (`invalid` → `null` as before). Null-digest partitions yield `invalid` inside the atom (design §4.2). M05_S06 location strings updated. Residuals to step 8: double hash in two admitted-set readers; first-match census 212 sites; migrated readers reached only by the step 8 run |
| 6 | `c2432eb85` (step), `8eede7fdb` (repair) | build 32 s pass; `lint:imports` pass; unit lane `t287-calculus-fold` 6/6 (P-FOLD at 22 cuts on the U1 store, counterexamples A and B, both negatives); `test:installed:language` 45 s, 1/1 pass; both at the repair too | the contextual branches in `advance` (terminal Run census, per-process cleanup, liveness, lifecycle); the lifecycle re-derivations in `actor_process.ts` and `runtime_liveness.ts`; the axiom entries for the four lifecycle fluents | 2 Workers (Opus xhigh; the first stopped and reverted), 1 Reviewer (Fable max), 1 repair Worker (Opus xhigh) | `abg/calculus/`: `axioms.ts`, `rules.ts` (four rules; `actor_process_lifecycle` is the one producer of the four lifecycle fluents and of `actor_process_terminated`), `fold.ts` (`effectOf`, `foldStep`, `holdsAt` overloads), `index.ts`; `advance` is the `foldStep` loop with the class as memo. First attempt stopped under stop (c): the replay body digests the held fluent set into stored witnesses. Executive D7 ruled and re-activated by cherry-pick. Review: 1 S2 (the D7 trace: no path compares a stored witness with a recomputation; the Executive's trace was wrong, the code right), 4 S3, 2 S4; no S0/S1; quiescence change confirmed as intended (an exited, unclosed actor blocks root closure until its terminal; no change on the smoke or the U1 store). Repair: D7 wording in §4.4 and §10.6 row 5; liveness reads through `holdsAt` (R3, R4). R2, R5, R6, R7 to step 8 design notes. Emission premise: holds in `code/src` (one emitter), broken in two synthetic test stores; the rule's guard covers it |
| 7 | `ffb767171` (step), `dddb05dfd` (repair) | build 33 s pass; `lint:imports` pass; scenario `t287-lifecycle-failure-carrier` 4/4 (worker spawn failure; worker unresolved cleanup; helper route; D5 copy disagreement); `test:installed:language` 45 s, 1/1 pass | 3 edge formulas, 6 `holdsAt` reads, 10 copy reads, 3 helper formulas, 9 types, 4 key lists, 5 type checks, 7 copy-consistency checks (census of 47, all classified); `replay.ts` derivation from `actor_process_exited` gone; refusals carry `processFacts`; transport artifact carries `processFacts` | Worker Opus xhigh x1 (one commit, no stop); Reviewer Fable max x1; repair Worker Opus xhigh x1 (one commit, no stop; repair gate: build 32 s, lint, scenario 5/5, `m5-worker-transport` 21/21, smoke 1/1) | Review: S2 x1 (F1 pre-step-7 archives fail reconstruction; D8), S3 x6 (F2 §9.3 item 4 contradiction; F3/F4 helper bare `firstError` throws and HTTP cleanup carry no facts, an activation grant gap; F5 case b drives `firstError` null; F6 two stores; F7 dead WeakMap), S4 x3. A second review pasted by Jim (2026-10-23) found the same two code gaps and five step 4 to 8 items, all verified and routed to step 8 (`step-8.md`). One repair round: F1 to F8, accepted. Repair residuals: `t287-owned-process-lifetime` 15/18 on fixtures without `taskRef`/`taskDigest` and the retired bare-error assertions (8a, test files); P-LIFECYCLE no-child wording (8b). |
| 8a | `37ef7d760` (8a), `cac7802b2` (8a-2: six probes deleted under the `withAdmissionAuthority` digest premise, `:128` on `admitJson` with the fault channel ratified; quiescence and native-work expectations under D9; gate 7/7, 10/10, 6/6, 4/4, 18/18, smoke 1/1) | build 34 s; `lint:imports`; `lint:lifecycle` (10 allow-listed, 0 offenders); integrated run 34 files, 941 s: 16 files baseline-red with the same failure sets at `97b1200bc`; one step 7 failure (`t287-c2a-fp-source-contract`, source order) fixed; one new failure (`m5-terminal-quiescence-owner`, step 6 law) → D9; uat harness 30/1/3, the failure baseline-red | D4: bridge kept at 22 sites (none demonstrated); fold working state (P-FOLD 6/6); `admitJson` at 9 consensus comparands; member list exported; two test fixtures repaired (18/18, 21/21); preimage file deleted | Worker Opus xhigh x1 (one commit; three items stopped and recorded) | Completion: O-SHAPE, O-CODEC, O-SCHEMA (by ingress premise), O-KEY closed; O-RESOURCE closed at `cac7802b2` (seven probes); O-TYPE per site recorded. C2 production proof accepted on the `t287-worksite-command-execution:407` reach (two production comparisons, equal); step 4's zero hits were a manifest artifact. |
| 8 | review on `97b1200bc..cac7802b2`; repair `562d4515a` | whole-diff review (Fable max, same-family disclosed): S2 x1 (F1: the D9 sentence names a fluent the rule terminates; the D9 argument itself refuted), S3 x6 (F2 calculus imports and a function-level cycle; F3 P-INGRESS lint unrealized; F4 `canonicalRecordDigest` undocumented; F5 eight owner `safeParse` sites unrecorded; F6 P-RECORD path by reading; F7 ten edited suites unrun), S4 x4; proofs hold (P-LAYER for `shared/`); D6 to D8 confirmed; C2 route confirmed by reading; O-RESOURCE closed; every run failure attributed. Repair gate: build 33 s; `lint:imports`; `lint:lifecycle` 10 allow-listed, 0 offenders; `m5-terminal-quiescence-owner` 7/7; `t287-calculus-fold` 6/6 (two expectations that asserted the guard flipped); final run 44 files, 1096 s (`step-8-run-final.log`): the 34 files of the 8a run match it except quiescence now green; of the ten F7 suites one green, nine baseline-red with the same failure set at `97b1200bc` (three of them fail at load on a fixture coordinate, an environment variable or a missing export, so their step 2 path edits are unexercised past load); uat harness 30/1/3, the failure baseline-red | D9 reversed (the one conjunct at `rules.ts:151`); §10.6 row 5 restated | Reviewer Fable max x1; repair Worker Opus xhigh x1 (one commit, no stop) | Closed. Residuals: `rules.ts:127-129` comment still states the dropped guard (8b); the baseline attribution of `t287-cross-cut-public-read` needs its two gitignored fixture files linked into the baseline worktree. 8b and the closing post next. |
| 8b | `c8d3f8ecd` | none beyond read-back; one build for the `rules.ts` comment clause, rc 0; `lint:lifecycle` rc 0 | the dropped-guard clause in the `rules.ts` comment | Worker Opus xhigh x1 (one commit, no stop) | Ticket close subsection (`T-287` :5302-5388: commit chain, D0 to D9, completion condition, proofs, attribution, C2 route, as-touched remainders, items for Jim); GOAL-035 row and paragraph; design notes F2 to F10, R2 and R5 to R7, step 7 F9 and (ix), the C2 note in P-EQUAL, the D7 clause; constitution §16.14 (b) `canonicalRecordDigest`. Residuals: F5 is 13 `safeParse` sites at head (five of them at the baseline too), all listed; §9.3 item 7 cites `:285`, the call is at `:283`; §10.6 row 5's gate cells predate D1's acceptance; `GOALS.md:18` keeps a conjunction-frame sentence outside the library; ledger row 5's step 5 reason corrected here. |
| post-close A | `a1349e50b` | build; `lint:imports`; `lint:lifecycle`; lanes `t287-calculus-fold` 6/6, `t287-common-computational-library` 6/6, `t287-consensus-ref-shape` 1/1, `t287-native-frame-observation` new case passing (three pre-existing failures, attribution in B); `m5-event-calculus-runtime` and `m5-s03-authority` the final log's failure sets, `m5-worker-transport` 21/21; smoke 1/1 | the predecessor-cut read on the public liveness path; the shallow cast at the three raw Product dispatches; recursive admission at seven consensus reference arrays | Worker Opus xhigh x1 (one commit; item 2 stopped on §4.4 `:188`, outside the grant) | Post-close review findings 2, 4, 5 repaired with tests; 3 to repair B with the §4.4 sentence; D10 extended to the third raw dispatch; leaf validation now refuses non-I-JSON worker outputs (the boundary law; edge case in C). Order: A, C (O-TYPE census, D11), B (fold accumulator, helper handoff, final run). |
| post-close C | `99b80d6f5` | `tsc` clean; build rc 0 (contracts regenerated in digest and reference fields only; root event contract digest unchanged); `lint:imports`; `lint:lifecycle`; smoke 1/1; 161 lanes in four batches, every failure the final log's set or the same set at `0c362da15`; `m5-worker-transport` 21/21; Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `t287-common-computational-library` 7/7; `t287-consensus-ref-shape` 2/2; `t287-native-runtime-gate` 6 pass, 1 skip; tree clean | 2887 of 2951 `JsonValue` casts (2728 sink rows T 2347, I 202, A 179; 159 no-sink casts typed with them); kept: 9 stop rows and 55 no-sink casts outside the census | Worker Opus xhigh x1 (one commit, amended twice before the Return; no stop beyond the nine rows) | O-TYPE discharged at every census site but nine: four take (A) under D12 in B; five hold D14 for Jim. D13 (valueless result events) to B. `presentMember` (16 sites) and 22 `exactOptional` members realized; its §4.3 entry and the O-SCHEMA sentence to B. Lanes outside the 44-file list are attributed to `0c362da15` only; pre-plan attribution is B item 8. Ticket and GOALS say "closed" at `99b80d6f5`; B restates. |
| post-close B | `d8cf6b5d9` | build; `lint:imports`; `lint:lifecycle`; `t287-calculus-fold` 7/7; `t287-common-computational-library` 9/9; `t287-lifecycle-failure-carrier` 5/5; `m5-worker-transport` 21/21; the nine qualification lanes as repair C's batch 2; 46-file integrated run 329 tests, 251 pass, 58 fail, 2 cancelled, 18 skip, every entry the final log's or the baseline's but three `t287-calculus-state-transfer` entries from its `:64` timeout reached earlier under load (standalone reruns on both trees give the final log's set); uat harness the final log's set; Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; five lanes green; tree clean | the per-advance fold-state copy; the four realm stops (D12); `presentMember` at the four result-event lookups (D13) | Worker Opus xhigh x1 (one commit; items 5 and 6 stopped on the contract rule; one seam stopped outside the grant) | Items 1, 2, 3, 8, 9, 10 and two of item 7's five records landed. D12 realized one condition stricter than the row; ruling: the realization stands, row restated. Helper handoff stopped with its delta: D15 takes the design's own route (inline diagnostic subject, no Product contract change); to D with the forward-task S2 (fourth review), D14, the seam `t287-reacquisition-root-contract:39` (step 4 `5f4a1d4c9`) and the `:826` baseline fixture defect. |
| post-close D | `0eacd4668` | build; `lint:imports`; `lint:lifecycle`; `forward-command-contracts` 9/9; `t287-runtime-failure-diagnostic` 12/12; `t287-worksite-command-execution` 5/5; `t287-lifecycle-failure-carrier` 5/5; `m5-worker-transport` 21/21; `t287-reacquisition-root-contract` 1 pass 1 skip; 48-file integrated run 345 tests, 270 pass, 54 fail, 2 cancelled, 19 skip, 1160 s, no failing test new against `step-8-run-postclose.log`, two lanes better; uat harness 30/1/3, the baseline set; Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `forward-command-contracts` 9/9; `t287-runtime-failure-diagnostic` 12/12; `t287-reacquisition-root-contract` 1 pass, 1 skip; `t287-common-computational-library` 9/9; `t287-calculus-fold` 7/7; `t287-lifecycle-failure-carrier` 5/5; `t287-worksite-command-execution` 5/5; tree clean but for the untracked uat harness outputs and two untracked Codex files | the index loop at `worksite_command_forward.ts:134` (the plan's one private structural equality); the five lifecycle subject casts (D14); the helper's uncaught post-launch failures (D15); the `:826` byte-digest fixture; the reacquisition lane's missing binding | Worker Opus xhigh x1 (one commit, no stop) | Nine items landed. Comparison census 867 rows (846 re-typed, 20 merged, 1 structural returned). D15 proved on an installed C1 to C2 path (subject 3561 bytes inline). O-TYPE closed at every census site; completion condition met. Residuals for Jim in the closing post. |
| post-close E | `280f5777f` | build; `lint:imports`; `lint:lifecycle`; `tsc --noEmit`; `t287-worksite-command-execution` 5/5; `t287-observed-worksite-command` 8/7/1 (D's set); `forward-command-contracts` 9/9; `forward-command-owners` 6/2/4 (D's set); `t287-runtime-failure-diagnostic` 12/12; `t287-lifecycle-failure-carrier` 5/5; `m5-worker-transport` 21/21; `t287-reacquisition-root-contract` 1 pass 1 skip; 48-file integrated run 345 tests, 270 pass, 54 fail, 2 cancelled, 19 skip, 1224 s, 56 failing identities equal to D's log; uat harness 30/1/3; Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `t287-worksite-command-execution` 5/5; `forward-command-contracts` 9/9; `t287-runtime-failure-diagnostic` 12/12; `t287-lifecycle-failure-carrier` 5/5; `m5-worker-transport` 21/21; `t287-reacquisition-root-contract` 1 pass, 1 skip; `t287-calculus-fold` 7/7; `t287-common-computational-library` 9/9; tree clean | the acknowledgment gap on the helper failure route; the unread acknowledgment digest on non-success dispositions | Worker Opus 5.5 xhigh; Executive Fable 5.1 | fifth review S2 closed on the whole path; D15 restated |
| post-close F | `195b65ddb` | build; `tsc --noEmit`; `lint:imports`; `lint:lifecycle`; `forward-command-contracts` 10/10; `forward-command-owners` 6/2/4 (E's set); `t287-worksite-command-execution` 6/6; `t287-observed-worksite-command` 8/7/1 (E's set); `m5-worker-transport` 21/21; `t287-runtime-failure-diagnostic` 12/12; `t287-lifecycle-failure-carrier` 5/5; `t287-reacquisition-root-contract` 1 pass 1 skip; 48-file integrated run 347 tests, 272 pass, 54 fail, 2 cancelled, 19 skip, 1214 s, 56 failing identities equal to E's log; uat harness 30/1/3; Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `forward-command-contracts` 10/10; `t287-worksite-command-execution` 6/6; `t287-runtime-failure-diagnostic` 12/12; `t287-lifecycle-failure-carrier` 5/5; `m5-worker-transport` 21/21; `t287-reacquisition-root-contract` 1 pass, 1 skip; `t287-calculus-fold` 7/7; `t287-common-computational-library` 9/9; `t287-owned-process-lifetime` 18/18; tree clean | the forward constructors' trust in typed array inputs; the unbound helper failure subject | Worker Opus 5.5 xhigh; Executive Fable 5.1 | sixth review S2 and S3 closed; `predicate` member on the two HTTP subjects (D15 arm) |
| post-close G | `68a5397dc` | build (no tracked output changed); `tsc --noEmit`; `lint:imports`; `lint:lifecycle`; `t287-worksite-command-execution` 8/8 (312.9 s); `t287-observed-worksite-command` 8/7/1 (F's set); `m5-worker-transport` 21/21; `forward-command-contracts` 10/10; no broad run (no source change); Executive check on the head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 10 allow-listed; `t287-worksite-command-execution` 8/8; `forward-command-contracts` 10/10; `m5-worker-transport` 21/21; `t287-owned-process-lifetime` 18/18; `t287-lifecycle-failure-carrier` 5/5 (`exec_check_G.log`, 2026-10-24); the activation's premise confirmed by a direct probe on this host (Node 24.7.0): a mode-755 file of non-program bytes, and a shebang-less text file, each make `spawn` throw `ENOEXEC` synchronously; `ENOTDIR` likewise; `ENOENT` arrives as the asynchronous error | two helper failure classes without an installed case (`http_probe_failed`, `http_cleanup_unresolved`); six stale §9.2 citations | Worker Opus 5.5 xhigh; Executive Fable 5.1 | `command_failed` stopped: no declaration reaches it (owner's decision, T-290 Phase C); synchronous spawn errors publish nothing (repair H) |
| post-close H | `46ed04895` | build; `tsc --noEmit`; `lint:imports`; `lint:lifecycle`; `t287-worksite-command-execution` 10/10; `t287-owned-process-lifetime` 18/18; `t287-observed-worksite-command` 8/7/1 (F's set); `m5-worker-transport` 21/21; `t287-lifecycle-failure-carrier` 5/5; 48-file run 351/276/54/2/19 at 1491 s against F's 347/272/54/2/19 (`step-8-run-postclose-h.log`); Executive check on the head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 10 allow-listed; `t287-worksite-command-execution` 10/10; `t287-owned-process-lifetime` 18/18; `m5-worker-transport` 21/21 (`exec_check_H.log`, 2026-10-24) | synchronous spawn errors escaping the helper with no artifact and no acknowledgment at both launches | Worker Opus 5.5 xhigh; Executive Fable 5.1 | Phase A of T-290 closed at this commit |

Close (Executive, 2026-10-23): closing post `20261022T060245Z_CLOSE_library_consolidation.md`; head `c8d3f8ecd` plus the bookkeeping commit carrying this line; nothing pushed.
Reopened by the post-close review (2026-10-23): the Close line above stands for `c8d3f8ecd`; the delivery claim is restated when repairs A, C and B land.
Closed again (Executive, 2026-10-23): repairs A, C, B and D landed, head `0eacd4668` plus the bookkeeping commit carrying this line; the completion condition is met (no O-* open); the closing post is restated in place; nothing pushed. Next: the independent review.
Reopened by the fifth review (Executive, 2026-10-24): S2 on D15's acknowledgment handoff (the helper prints no acknowledgment on failure; the parent refuses the exchange before the artifact; the case supplied the acknowledgment); repair E activated (`step-8.md`, `## Post-close repair activation E`). The Closed again line stands for `0eacd4668` with D15 narrowed to artifact publication, downstream admission and cold retrieval under a supplied exchange. D15's row is restated when E lands. Nothing pushed.
Repair E landed (Executive, 2026-10-24): `280f5777f`; the fifth review's S2 is closed from the helper's exit on; D15 is restated above. The sixth review (2026-10-24) is filed in `step-8.md`: S2, the forward constructors trust their typed array inputs; S3, the failure artifact's subject is not bound to the next undone operation; repair F activated. The close and the debt wave are planned in `T-290`. Nothing pushed.
Repair F landed (Executive, 2026-10-24): `195b65ddb`; the sixth review's S2 and S3 are closed; repair G activated (the three helper failure classes on the installed route). Nothing pushed.
Repair G landed (Executive, 2026-10-24): `68a5397dc`; two of the three classes driven on the installed route; `command_failed` unreachable by any declaration, the owner decides its keeping (T-290 Phase C); the Worker's finding that a synchronous spawn error (`ENOEXEC`) publishes no artifact becomes repair H, activated. Nothing pushed.
Repair H landed (Executive, 2026-10-24): `46ed04895`; a synchronous spawn error is the no-child launch failure at both launches, two installed `ENOEXEC` cases. Phase A of T-290 is closed; the review subject is `46ed04895`; Phase B runs from TD-06 in `work/T290_DEBT_WAVE_01/packages.md`. Nothing pushed.
