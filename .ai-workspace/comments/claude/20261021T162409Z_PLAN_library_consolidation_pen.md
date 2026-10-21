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
A same-actor transition to Writer is not planned; if one becomes necessary it
is recorded in the ledger before the effect, as the basis requires.

**Worker: Opus 5.5 at xhigh effort, fresh agent, one at a time.** Writer grant
per step: the files, retirements and gate named in that step; commits on
`main` with the step's message; returns changed paths, gate output, residuals
and the return route. A Worker does not widen the step, does not read Codex
material beyond what the activation names, and does not read reviewer
transcripts, only the review file.

**Reviewer: at max effort, fresh agent, over the frozen commit by hash, at
steps 1, 6, 7 and 8 only.** Returns findings graded on the project scales
(severity `S0` to `S4`, priority `P0` to `P5`), each with chaseable evidence
(file and line, command, output). Step 1 is reviewed by Opus 5.5, because
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
4. Executive triages. `P0` to `P2`: one bounded repair activation to a fresh
   Worker carrying the review and the commit hash, never a message to the
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
negative, at step 7. Broad suites, stable-atom reruns and the thirteen
lifecycle and calculus suites run once, at step 8, the integrated
qualification boundary (SP-06; EXECUTIVE_BASELINE §8: substantial cycles
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
| D0 | Withdraw the cross-consumer handoff that Root's conjunction decision (`realization/common-consolidation-conjunction-01/decision.md`, row "Cross-consumer handoff") accepted as bounded DESIGN. Replacement: B13. | Withdraw. The HOW itself says it admits no event. | step 1 |
| D1 | `ROOT_DERIVED_RULES` as the carrier of contextual Event Calculus effects (realizes the IACS's `RuntimeDerivedFluentRule`). | Yes. | step 6 |
| D2 | `checkExactRecord` digest leg runs after projection (`expected(event, value)`), not before. | After projection; the signature already says so. | step 5 |
| D3 | The two "native composite classifications" (O-TYPE) are ingress questions answered by `admitContract`, not an `encode` parameter on equality. | Yes. | step 3 |
| D4 | Throwing `i_json` API: keep as a thin lift over `admitJson` through step 7, retire at step 8. | Keep then retire. | step 3, step 8 |
| D5 | Retire `terminationConfirmed` (and siblings `exitObserved`, `timedOut`, `signalSequence` where derivable) from event payloads and artifacts via a new root event profile `@2`, legacy digest retained (the mechanism exists: `abg/event_contract_profiles.ts`). Alternative: keep the field and add a fold-time equality check against the fluent. | Profile `@2`. | step 7 |

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

Gate: steel thread. No unit lane: these atoms are thin wrappers over the
JSON parser and the schema library (SP-05). P-INGRESS and P-KEYS are
established at step 8 by the integrated run. Commit.

### Step 4. Value family (`realization_refactor`)

`shared/value/`: `canonicalEquals(JsonValue, JsonValue)`, `writeCanonicalRecord`,
`sha256Canonical`, `sha256Bytes`, `deepFreeze`, `isDeeplyFrozen`. Retire the 12
`sameCanonical*` copies (including `hog/parent_rehydration.ts:62`), the 39
inline comparisons, the 3 hand-rolled writers. The C2 bug at
`abg/execution_basis.ts:529` closes by type: the body view passes `admitJson`
before comparison. `c_call.ts` carries most sites.

Gate: steel thread, plus one focused unit lane for the new irreducible atom:
P-EQUAL (equality agrees with digest equality on `JsonValue`; the C2
counterexample is refused at ingress). Commit.

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

Replaces the withdrawn step 6 of the design.
1. `shared/owned_process_lifetime.ts`, `abg/worker_transport.ts` (`runProcess`
   at `:451`), `implementation/worksite_command_helper.ts` command and HTTP
   adapters: terminal facts return as a refusal carrier with `OwnedProcessFacts`
   as evidence; no rethrow. `hog/ccall_lifecycle.ts:551` passes that refusal to
   `failCCall`, so `failTraversal` admits it at the successor prefix.
2. Root event profile `@2`: `terminationConfirmed` leaves `actor_*` payloads and
   result artifacts; the 20 known sites read `holdsAt`; `replay.ts:2444`'s
   recomputation goes. Legacy digest retained for recorded stores.
3. No `process-failure.json`. `inspectWorksiteCommandExecutionProcessFailure`
   is a projection at the prefix in `product/worksite_command_execution.ts`.
   `task.json`, `launch.json`, `result.json` stay as spawn-boundary transport.

Gate: steel thread, plus one focused integration scenario at the changed
seam with its material negative: a no-child launch failure yields the same
fluent on worker, command and HTTP, and no file is read (P-LIFECYCLE whole
path; SP-06). The lifecycle suites wait for step 8. Commit.

### Step 8. Close

- D4 retirement of the throwing `i_json` entry.
- Lint rule for the B13 invariant: no lifecycle boolean computed or copied
  outside `abg/calculus/` (the `holdsAt` falsifier as a check).
- The integrated run, once: `npm test`, `npm run test:m5`, and the thirteen
  lifecycle and calculus suites (`t287-owned-process-lifetime`,
  `m5-worker-transport`, `m5-event-calculus-runtime`,
  `t287-event-calculus-owner-continuation`, `t287-calculus-state-transfer`,
  `m5-fresh-process-reconstruction`, `t287-reconstruction-conservation`,
  `t287-worksite-command-execution`, `t287-observed-worksite-command`,
  `t287-runtime-activity-quiescence`, `m5-terminal-quiescence-owner`,
  `t287-generic-job-lifecycle`, `m5-event-store-reopen`). A failure returns
  to the first violated seam (SP-09); bisection over the eight step commits
  localizes it; no test expansion.
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

| Step | Commit | Gate | Retired | Agents | Note |
|---|---|---|---|---|---|
| 0 | | | | | |
