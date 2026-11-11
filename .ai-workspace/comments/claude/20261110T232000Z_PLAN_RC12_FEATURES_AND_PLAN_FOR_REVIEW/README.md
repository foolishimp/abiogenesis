# RC12 features and plan, for review

Commentary, not law. Written by Claude (Fable 5.2), acting as Executive for the RC12 build. It supersedes the direction post `20261110T222500Z_DIRECTION_RC12_EXECUTIVE_WITHIN_HOG`, which assumed Codex would build under a proxy. The owner then directed, on 2026-11-11: "i'd like for you to make the build directly as executive", and "stop asking stupid questions ... run from the precedences established". This post is self-contained: a reviewer needs no other conversation.

## 1. Objective and basis

**Objective** (recorded in `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-operational-pin-01/RC12_INTENT.md`): a reference-frame-governed Executive operating within HoG. It chooses registered GraphFunctions, including differently framed reviewers. Consequence is its next-step judgment. ABG admits transitions and HoG executes them. Consensus is superseded as a separate feature.

**Principle.** The Executive is the Consequence role under an executive reference frame, applied recursively (`specification/PRODUCT.md:1217`, `:760`). It proposes the next work and nothing else. Folding child results is deterministic. Completion is a deterministic computation over admitted verdicts.

| Item | Value |
|---|---|
| Source base | `b7cf409fc`, the accepted Phase 2 source on `codex/rc11-foundation-correction` (seven commits ahead of `main`'s parent) |
| Work location | worktree `/private/tmp/abg-rc12-executive-20261111`, branch `claude/rc12-executive` |
| Build route | made directly, not through the pinned RC11 builder (owner: "in the interest of time") |
| Executive | Claude Fable 5.2: decomposes, rules, reviews. Does not write source |
| Writers | Claude Opus 5.5 at xhigh effort, one at a time, each with a bounded grant and a Return file |
| Independent review | once, at the cut |
| Baseline | `npm run build` passes in 30 s; the five default-library test files give 61 tests, 51 pass, 0 fail, 10 environment-gated skips |

T below means `build_tenants/abiogenesis/typescript`.

## 2. The finding that sets the scope

The RC11 build used ABG for the Worker step only. The last RC11 call (`rc11-effect-phase2-01/native-b02/host.mjs` in the T-287 work root) selects the native work Program directly and waits on stdin for Root's admission. Selection, reviews, proof runs, conjunction and acceptance were Codex's Root session, written as about 40 files beside the event log for that one call. No prepared call from RC5 through RC11 names the in-framework Executive.

Three things already exist in the source and are not rebuilt:

- the Executive graphs `executive` and `executive-step` (`T/code/src/gtl/default_library.ts`), with six registered stage wrappers;
- a kill-and-continue proof on the Executive path: test "default-library Run interrupted at the durable entered Testing cursor resumes once in the same Run through the cold Public pending_execution arm" (`T/test_env/tests/t287-default-library.test.mjs`), with SIGKILL, the `run.continue` CLI and a scripted stand-in model;
- a live installed Executive test in the same file, switched on by `ABI5_DEFAULT_LIBRARY_LIVE=1`.

## 3. Features

| Id | Feature | State at the base | Package | Status |
|---|---|---|---|---|
| E1 | The Executive drives a real task from one public invocation | Present; last used live in the RC4 round | demonstration | Proved live only at the end |
| E2 | Reviewer types are reference frames: a task declares its reviews, one assessor graph serves them, the selector names the review | One assessment; only a UAT verdict counts | A | Accepted at `a82a365cc` |
| E3 | Completion requires the acceptance verdict and every required review verdict, satisfied and current | Reads only the last observation | A | Accepted at `a82a365cc` |
| E4 | A verdict lapses when its declared subject changes, so only affected reviews run again | Exists for the single UAT verdict | A | Accepted at `a82a365cc` |
| E5 | A child failure (time ceiling, refusal, crash) returns to the Executive as an observation; it chooses the successor | Not traced. The RC11 build hit the 900-second ceiling three times and Root chose each successor | B | Not started |
| E6 | After the host is killed, a fresh process continues the same Run from the event log | Proved model-free on this path | none | No new work unless a proof goes red |
| E7 | The Executive's step limit yields a typed bounded outcome naming what is unresolved | The limit is a Program declaration (default 12; the build host passed 8). The outcome at the limit is unverified | B | Not started |
| X1 | Standalone Consensus is retired: Product text, then code | 16 dedicated files (`T/code/src/gtl/consensus.ts` is 5,267 lines), references in 11 source files, 16 test files and 12 qualification contract files | C | Not started |
| X2 | Read-only census of the three choice mechanisms: `registered_selection`, `gate`, and the `consequence` term of `C.edge` | Two mechanisms realize one choice | census | Not started |

Outside RC12: human response with same-run resume, same-edge yield, the tuner, further host adapters, the HTTP and worker refactors, reviewers run in parallel, and authoring the task declaration from a short brief.

### Package A in detail (the part with design content)

Rulings given to the Writer, each to be verified against the code before use:

1. `review` is a seventh registered purpose. Its wrapper reuses the template the `uat` wrapper uses. No new role row, operation, implementation binding, application kind, event kind or runner.
2. `original.reviews` is optional. Each entry is `{ reviewRef, frame, required, order, assessment }`. `frame` is a text statement of the reference frame. `order` and `assessment` reuse the existing shapes. A task without reviews is unchanged in state, prompt, response schema and digests.
3. The selector's judgment gains `reviewRef`, present exactly when the task declares reviews.
4. One function owns which assessment declaration applies, for both `uat` and `review`.
5. A `review` observation carries its assessment value and its `reviewRef`.
6. The parent computes a standing row per declared review (`resultRef`, `satisfied`, `current`) and sets `terminal` only when acceptance and every required review are satisfied and current. A verdict from another Run is not current.
7. The selector sees each declared review with its standing.
8. Fulfillment and reviews compose: a review never changes fulfillment coverage.

Deviations the Writer reports in its Return. The Executive reviewed the diff and accepted them, except the default argument:

- Acceptance is the latest `uat` row that only `review` rows follow, not the latest `uat` row. Reason: a no-review task with a satisfied UAT followed by a no-effect Construction stays open today and must stay open.
- The review wrapper is unselectable when the task declares no reviews.
- The fixed direct Testing/UAT route refuses declared reviews.
- `governanceAssessmentContract` keeps a default argument for one test outside the grant. The Executive intends to discharge this in the repair round.
- Every latest review row is authenticated against the event log, adverse rows included.
- Currentness uses native-work changed-path overlap only, as UAT acceptance does.

Product text added in `PRODUCT.md`, "Default Governance And Lifecycle Library": two paragraphs stating framed review and the completion computation. Design section added at the top of `T/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`.

Exit proof: one scripted Run through the Public start with two required reviews. Construction; review B satisfied; review A adverse; correcting Construction; Testing; UAT satisfied with the parent still open; review A satisfied; the parent closes. Review B runs once.

## 4. Plan

1. **Package A** (accepted). Commits `b7cf409fc..a82a365cc`. The five library test files plus the new reviews file give 68 tests, 58 pass, 0 fail and the same 10 gated skips. The Executive reran the new file: 7 of 7, including the scripted Public Run with two required reviews.
2. **Package B** (trace running). First a read-only trace of current behaviour when a wrapper's native child fails: the events admitted, the Run's disposition, the lawful actions projected, and what `run.continue` then does. The Executive rules on the smallest lawful route from that trace. Then implementation, with the E7 bound test.
3. **X2 census**, read-only. It decides whether registered selection folds into the consequence route in RC12.
4. **Package C.** Product reprice text for Consensus, then deletion of its code, schema, vocabularies, tests, designs and requirement file.
5. **Cut.** Version `5.0.0-rc.12`, local and unqualified, installed by the route RC11 used (`rc11-qualification-01/install-01/install-local-rc11.mjs`).
6. **One live demonstration** on the installed candidate: the existing live test extended with two declared reviews, the model CLI as provider. Record Root decision files inside the Run (target zero), elapsed time and cost per Executive step, and selector prompt bytes.
7. **Broad suites and independent review**, once.
8. **Merge** `claude/rc12-executive` into local `main`. No push.

Each package has one activation, one Return and one status line.

## 5. Rulings made on the owner's behalf

| Question | Ruling | Precedent |
|---|---|---|
| Retire standalone Consensus | Yes, as package C | Owner: "consensus has been replaced by executive"; standing rule: discharge technical debt, never record it for later |
| Change the governance work-state contract | Yes, as optional members under the unchanged schema version | `fulfillment` and `requirementProposals` were added the same way |
| Fold registered selection into the consequence route | Undecided until the census. Do it in RC12 only if it is a deletion that needs no new mechanism | Owner's consolidation rule |
| Merge to local `main` | At the end, carrying the foundation branch with it | RC9 integration; standing rule: no push |
| Baseline Run on installed RC11 | Dropped | Owner: "in the interest of time" |
| Per-task step limit | Dropped. The limit stays a Program declaration | The design states that the Program fixes the recursion bound |

## 6. Questions for the reviewer

1. **Frame as text.** A declared review carries its frame as a text statement in the admitted task. The Product says frame bindings are explicit, addressable and reusable, and are not invented by prompt assembly. Should a review name a frame declared in the run environment instead?
2. **A seventh purpose.** Is a separate `review` purpose right, or should the `uat` wrapper serve every assessment, with acceptance as one declared review?
3. **Standing in state.** The standing rows are derived facts carried in the work state and recomputed by the parent at each step. Is that a side copy beside the event log, or a lawful admitted Result?
4. **Subject of a verdict.** Currency covers the review's declared candidate, sources and rubric. A review that also read other files is not invalidated when those change. Should the subject be the review's actual read set?
5. **The acceptance rule** in the first deviation above.
6. **Package B.** Is "failure as an observation inside the same Run" the right target, or is a typed stop followed by continuation the lawful design?
7. **Package C.** Consensus is entangled with the qualification contracts. Is removal in RC12 right, or should RC12 remove only the Product claim?
8. **Omissions.** What does the owner's objective need that this list lacks?

## 7. Where to look, and what is not verified

- Package A: `git -C /private/tmp/abg-rc12-executive-20261111 diff b7cf409fc..a82a365cc`, and the new file `T/test_env/tests/t287-default-library-reviews.test.mjs`.
- Writer's Return: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/A_RETURN.md` in that worktree. The Executive's one-line dispositions are in `LEDGER.md` beside it.
- Not verified: any live provider run, and everything in packages B and C. Package A's end-to-end proof uses a scripted stand-in model.
- Reviewer and Writers share one model family with the Executive unless the review runs elsewhere.

## 8. Review 1 and the Executive's dispositions (2026-11-11)

An independent session reviewed this brief at `bdcae3559` and package A at `6b521afd2`. Verdict: changes requested. Its standard: GTL defines the process over the workspace; the framework enforces that process while agents do the work; the Executive chooses among permitted next steps, and its judgment does not replace declared prerequisites, permissions or completion conditions.

The Executive verified the three source findings by reading the code and accepts all of them.

| Finding | Verified at | Disposition |
|---|---|---|
| A review stays current after a mandatory input changes. Preparation binds `order.readFirst`; the parent checks only sources, candidate and rubric. | `nativeTask` and `projectGovernanceParent` in `T/code/src/abg/default_library.ts` | Repair in package A2. Cause: the Executive's ruling 6 named the subject too narrowly. Currentness follows the review's material dependencies; one function owns that set for preparation and parent. |
| A Testing command that writes inside its permitted territory does not invalidate a retained review. | Index classification in `T/code/src/abg/runtime_history.ts` (about line 700) and `worksiteCommandSourcesInvalidatedAfter` in `T/code/src/abg/native_worksite_execution.ts` | Repair in package A2: both the index and the invalidator. Inherited defect, exposed by review reuse. |
| The native handoff drops `original.authorityRefs`, which the selector receives. | `nativeTask` instructions | Repair in package A2 through the existing task envelope. Inherited. |

Changes to the plan:

1. **Package A2** (next Writer): the three repairs above; removal of the default argument; Product wording narrowed so that only the completion computation is closed to Executive judgment, while applicability, conflict, dependency and sufficiency remain its judgment; design notes that separate the acceptance rule from dependency-based freshness and state what a frame declaration must identify.
2. **New feature E8: declared process prerequisites, enforced before effects.** Today the selector's `dependsOn` is advisory and `required` gates only final completion. A rule such as "design review passes before Construction" is declared through the Program's existing constraint relations, the selector is offered only permitted next steps, and an out-of-order choice is refused before any effect. A read-only census of gate and selection-admission semantics precedes the ruling on its route.
3. **X2 is closed as a ruling:** registered selection does not fold into the consequence route in RC12. The move needs validation and admission changes, so it is not a deletion.
4. **Package B:** same-Run observation only for explicitly recoverable child outcomes (a confirmed-ended attempt with attributable effects). Integrity failures, uncertain effects and unconfirmed termination keep their blocking meaning. It needs a declared outcome and foldback, not an extra row.
5. **E7:** the bounded outcome and its unresolved obligations are proved through cold Public readback, and the counting of the bound is defined.
6. **E6:** the existing kill-and-continue proof stops at a durable cursor before the call opens. The claim is limited to that boundary and the proof is rerun after package B.
7. **Package C:** full Consensus retirement if its dependency cone closes. Tests that use Consensus as a specimen for a generic law are re-pointed, not deleted.
8. **Demonstration:** one declared process on one frozen installed candidate: an out-of-order step refused before its effect, a lawful successor selected from admitted evidence, a correction, an unaffected review preserved, completion. The reviews are semantically discriminating (the frame changes the verdict), and the record binds the independence policy and the actual actor identities.

Order: B trace (running) → A2 → census for E8 → rulings on B and E8 → implementation → C → cut → demonstration → broad suites and independent review on the unchanged candidate → merge to local `main`.

## 9. Owner framing and its effect on the build (2026-11-11)

Owner: "i see it as a part of an automation where non technical users can make changes to the specification the automation can then reliably build their amendments to an existing system, abg is moving increasingly to an independent governance framework independent of the native agents".

The feature list keeps its shape. The framing fixes what the features are for: the user cannot inspect the engineering, so review freshness, authority carriage, enforced prerequisites, understandable stops and truthful completion are the product. Effects:

1. **The demonstration witness is an amendment to an existing working system**, not a newly generated file: one business rule changes in the specification; the Run identifies what is affected, implements and verifies the amended rule at its boundary, and preserves an unrelated rule through its write territory, the existing tests and a preservation review.
2. **The witness input is two parts:** a process definition written once (stages, reviews with frames and criteria, test plan, prerequisites) and the amendment, which is the only per-task input. The function that joins them stays in the witness harness in RC12. Publishing the process definition as a library contract is the lead feature of the next cut.
3. **Agent independence is a design constraint:** outcome classes in package B are ABG's own typed classes, not provider text; the library gains no provider-specific logic; the demonstration record names the actor and model of every call. Operation across vendors is not claimed.
4. **Every non-completion outcome is readable** through the Public result with its reason and unresolved obligations: step limit, gap, block and failure. E7 widens to cover them.
5. **Measures:** human interventions inside the Run, tokens, elapsed time, and one run of a bare model CLI on the same amendment for comparison, reported as a single observation.
6. **Intent:** `specification/INTENT.md` states the mechanism-level problem and does not state this use or agent independence. The branch carries a short proposed intent amendment for the owner to ratify at merge.

Not added to RC12: the user-facing amendment application, release automation, and the published process-definition contract.

## 10. Failure trace and the Executive's rulings (2026-11-11)

The read-only trace is `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/B1_TRACE.md` in the worktree (commit `62fd17271`), with event tables from seven scripted Runs through the Public start.

**What happens today.** Every child failure (process exit, time ceiling, invalid report, write outside the grant, assessor exit) lifts through the wrapper and the step to the Executive parent and ends the Run as `runtime_failed`, with no failure class in the Public outcome. No continuation exists and `run.continue` is refused. A new start is a new Run whose selector sees no observations and repeats the choice. The failed worker's changed paths are in its failure Result but nothing shows them to the selector. No retry is declared anywhere in the library. At the step limit the Run stops `blocked` with only `bound-exhausted`; a limit of N admits N−1 steps.

**The Executive's hypothesis failed.** A declared `re_enter` from the failed wrapper back to selection is refused by the validator, the executor and admission, and the parent recursion would end the Run anyway.

**Ruling on package B (route R of the trace):**

1. The `recurse` application's foldback gains one optional declared member naming recoverable failure classes. When a recursion child ends failed with an originating class in that set, admission accepts the existing `failed` child disposition and the parent re-evaluates over its prior admitted input. With nothing declared, behaviour is unchanged.
2. The library's `executive` declares process exit, time ceiling and invalid report as recoverable. A write outside the grant and every integrity class are not.
3. After a recoverable failure the parent also requires, from the event log, that the attempt's effects are attributable: the failure Result carries its post-work observation and no unconfirmed-termination or unknown-effect fact exists. Otherwise the Run stops.
4. Failed steps consume the step limit. There is one limit and one bounded stop.
5. No failure row enters the work state. Selection preparation folds the Run's failed attempts from the event log into the selection task: the graph chosen, the originating class, the timeout class, the attributed changed paths and the failure Result reference. Those references join the selector's admissible evidence.
6. A preparation refusal never re-enters. It stops the Run with its stage and relation readable.
7. Public readback: a failed or blocked outcome carries its originating class and reason, and for the Executive the unresolved obligations and review standing of the last admitted parent Result, after cold reopen. A stop never reads as completion.

**Ruling on E8, process prerequisites:**

1. The library publication takes a process declaration: per registered purpose, the reviews that must be satisfied and current before that purpose may be selected. It is carried on that purpose's wrapper GraphFunction, so it is part of the admitted Program and its digest.
2. One relation decides whether a registered target is permitted in a state. The selector's offered choices, its response schema, the strict binder and the deterministic choice projection all apply it, so a non-permitted choice is refused before the wrapper is entered.
3. A task whose Program requires a review it does not declare is refused at intake.
4. A refused choice is a recoverable failure of the selection step, so the Executive selects again with the refusal visible, within the step limit.
5. The selector view shows, per target, whether it is permitted and which prerequisite is missing. `dependsOn` stays advisory.
6. RC12 does not use the `gate` application. The Executive found validator and serialization handling for it but no execution in the executor directory; that reading is unverified.

**Defects the trace found, with dispositions:**

| Defect | Disposition |
|---|---|
| The inactivity timeout never fires for a silent worker; only the absolute ceiling does. The cause is a reading, not yet captured at the threshold | Own package with root-cause triage first |
| The Public failure outcome is generic | Package B, ruling 7 |
| The step-limit stop names no obligations | Package B, ruling 7 |
| Liveness reports `continue_waiting` on a failed Run | Fixed with ruling 7 if it falls out of the same projection; otherwise recorded |

Order now: A2 (running) → B recoverable failure → E8 → Public readback and the inactivity defect → Consensus → amendment witness, cut, install, demonstration.

## 11. Owner insight: the default configuration implements STDO 3.x (2026-11-11)

Owner: "i should lean into an ABG configuration that is an out of the box implementation of STDO 3.x".

**What exists.** The Product has a section "STDO-Governed Run Environment". The default library's run environment binds the exact STDO release by member inventory and digest, and gives the selector, constructor, assessor and command executor their STDO role material. Every assessment receives the same reviewer material.

**Effects on RC12:**

1. The process definition of section 9 has a name and a default: the STDO software-amendment configuration. It is the default library, its STDO run environment, its process prerequisites and its review declarations. A project supplies its bindings (paths, build and test commands, acceptance criteria). A task supplies the amendment.
2. **E8 ruling 3 changes, to keep adaptive judgment.** Every review the Program names is declared by the task, either as required or as not applicable. Prerequisites bind the required ones. A Program-named review missing from the task is refused at intake. Nothing is skipped silently, and a small amendment is not forced through every reviewer.
3. The witness is an STDO-shaped existing system: a specification with requirement files, an implementation and tests. The amendment edits one requirement. The Run performs intake triage with the change class, impact assessment, implementation, tests, reviews whose frames name exact STDO sources, and acceptance.
4. The demonstration record carries a coverage statement: the STDO relations the configuration exercises and those it does not. The claim is a tested STDO software-amendment workflow, not an implementation of all of STDO.
5. The intent and Product draft on the branch names this configuration.

**Not in RC12:** selecting different STDO material per review through the run environment (in RC12 review types differ by their declared frame statement and rubric); applicability decided by an admitted Executive judgment at intake instead of by the task declaration; rebinding to a later STDO release; release bindings.

## 12. Parallel phase and the inactivity ruling (2026-11-11)

The owner allowed one worker per parallel task. Four lines run in their own worktrees, all from `62fd17271`:

| Line | Worktree | Branch | Work |
|---|---|---|---|
| Main | `/private/tmp/abg-rc12-executive-20261111` | `claude/rc12-executive` | Package A2 repairs, then recoverable failure, then process prerequisites |
| Consensus | `/private/tmp/abg-rc12-consensus-20261111` | `claude/rc12-consensus` | Consensus retirement; a short intent amendment in the owner's words as its own commit |
| Liveness | `/private/tmp/abg-rc12-liveness-20261111` | `claude/rc12-liveness` | Inactivity liveness |
| Witness | `/private/tmp/abg-rc12-witness-20261111` | `claude/rc12-witness` | Amendment witness, test-side only |

**Inactivity triage** (`L_RETURN.md` on the liveness branch, commit `aebc02fdd`). The cause is established and affects every native actor, real or scripted. `abg/calculus/liveness.ts` lets the inactivity outcome happen only under complete probe coverage, and no producer reports coverage for tool progress, API progress or archive. The absolute ceiling is therefore the only effective bound, and a declared inactivity value does nothing. A green test, `t287-management-supervision`, encodes that behaviour.

**Ruling.** REQ-R-ABG3-TRANSPORT-027 says runtime liveness is governed by an inactivity lease over admitted probe activity, and TRANSPORT-028 says the hard cap exists only as outer safety evidence. Requirements outrank the test. Unknown coverage protects the no-progress classification; it does not protect a live actor whose lease has expired. Containment happens at lease expiry regardless of coverage, with the existing inactivity cause. The test's claims are corrected. A host must declare an inactivity longer than the longest interval in which a working actor emits no admitted activity, because tool, API and archive progress have no producer.

**Second ruling.** On a failed or stopped Run, frames report `continue_waiting`. An admitted interruption is a fact and outranks an absent frame policy, so those frames report the blocked disposition.
