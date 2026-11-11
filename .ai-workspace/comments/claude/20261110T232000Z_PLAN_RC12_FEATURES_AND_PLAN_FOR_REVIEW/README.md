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

## 13. Independent reviews 2 and 3, and the Executive's dispositions (2026-11-11)

Both reviewers are Claude Opus 5.5 at maximum effort, fresh contexts, same model family as the authors. Review files: `/private/tmp/abg-rv1-tmp/RV1_REVIEW.md` and `/private/tmp/abg-rv2-tmp/RV2_REVIEW.md`.

**Review 2: inactivity repair and cut preparation.** Verdict: accept with repairs. It confirms the inactivity ruling as the lawful reading.

| Finding | Disposition |
|---|---|
| A working agent can be ended for inactivity. ABG counts only model progress as activity and ignores the agent CLI's 30-second status heartbeat. In 24 recorded real runs every silent stretch of a minute or more was a context compaction of 89–129 seconds with that heartbeat running. A 60-second inactivity would end 5 of the 24; 180 seconds ends none | Repair running (package H): the status heartbeat renews the lease and is not progress; retry rows keep their meaning |
| REQ-R-ABG3-RETRY-008 maps inactivity to `no_output`; the design forbids that claim without probe coverage and the code gives `transport_failure` | Requirement repriced to the ratified design, in package H |
| Stale `release-claim.md` (rc.7) and candidate basis (rc.4) | Fixed in the cut's stamp commit |
| Inactivity containment is an as-of reading that output during the termination grace can flip; the startup timeout is unreachable for real agents | Recorded |

**Review 3: readable stops and the package A repairs.** Readable stops: accept with repairs. Package A repairs: changes requested.

| Finding | Disposition |
|---|---|
| **The Testing-command invalidation rests on a false premise.** A command Result's `worksiteDelta` describes the helper's sandbox under the attempt root, not the worksite. The reviewer ran the real helper: the worksite file stayed byte-identical and the rule still returned invalidated | Withdrawn. The Executive accepted the outside review's finding after checking only that the rule ignored command Results, not what the delta denotes. The planned extension to revision and forward command kinds is cancelled |
| The Product and design text promise more than the code keeps for command effects | Corrected with the withdrawal |
| Three different file sets govern one verdict: the producer's whole after-state at preparation, everything in the read roots for the assessor, the declared set for currentness. "Only declared material" is prompt text | Recorded as a limit. Enforcing it means restricting what an assessor can read, which belongs with unobserved writes outside read roots |
| The test of a stale review after a `readFirst`-only change stubs the invalidation owner | The case moves into an end-to-end scripted Run over a real event log |
| Readable stops: the statement asserts unresolved obligations for any last Result; an operator stop's recorded reason reads as absent; the origin of a stop is found by position, so a handled child failure could be named as the cause of a later stop; the start command's output carries no statement | Repairs running (package RR), with the origin established by causal references |
| A closed Run with a handled failed foldback still presents the folded frames as live | Package RR applies the quiescence reader rule in the Public read, on condition that no recorded Run's replay digest changes |

## 14. Independent review 4: the Consensus retirement is backed out of RC12 (2026-11-11)

Review file: `/private/tmp/abg-rv4-tmp/RV4_REVIEW.md`. Verdict: changes requested.

**Blocking finding.** The retirement's dependency cone is open. "The standard system program" is required at three sites: `specification/PRODUCT.md` section "System And One Surface", the feature row `A5-F07`, and REQ-P-POLICY-023. Its only shipped realization was `program://abg/system/consensus-one-surface@5` in the removed Consensus module. After the removal the default `supervised` start mode has no shipped target. Scenario `ABG5-S03` can be met by a consumer's program, and its tests run on consumer fixtures; the feature and the requirement cannot.

**The Executive's ruling was wrong.** In section 8 and later the Executive accepted the removal and reworded two Product sentences to "A system program". That is a Product reprice of a selected 5.0 feature. It needs the owner's own decision.

**Disposition.** The retirement is backed out of the RC12 line (package CB, running). RC12 keeps Consensus exactly as the base had it. The retirement stays prepared on branch `claude/rc12-consensus` at `9c086294b`, with the review's repairs listed in `C_RETURN.md`.

**Owner decision needed before the retirement proceeds:** how `A5-F07` is realized and proved once the Consensus program is gone, and what the default start mode targets. Two lawful routes: re-home the standard system program onto the Executive, with the four One Surface authorities; or reprice the feature to a law without a shipped program and choose the default start mode explicitly.

**Other findings accepted.** The intent amendment's "as the default experience" conflicts with the Product's rule that a Program adopts the STDO environment explicitly; it becomes "out of the box", adopted explicitly. Change authority for RC12's Product and requirement edits is not recorded in a tracked authority surface; the Product header gains it at the close of the integration line.

## 15. Close: the candidate, its evidence and the decisions left to the owner (2026-11-11)

**RC12 is integrated into local `main`. Nothing is pushed.** `5.0.0-rc.12` exists as a local, unqualified, unpublished candidate. It completed one live Run, on the sunny path. The Consensus retirement is not in it. The Executive first left the merge to the owner; the owner then ruled it (15.7), and the merge is `99e6085b0`.

### 15.1 Identity

| Item | Value |
|---|---|
| Branch | `claude/rc12-integration`, head `34aafb2c6`; on `main` through two-parent merge `99e6085b0` over preservation commit `89ee06e15` |
| Cut commit | `95da94e725c709b8307b125f20f350861fc1e8a3`, tree `b1586e3c6fb0b553105db7989f10990bb8918f0a` |
| Archive | `~/Library/Application Support/ABIogenesis/releases/5.0.0-rc.12/abiogenesis-typescript-tenant-5.0.0-rc.12.tgz`, `sha256:db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca`, 11,062,933 bytes, 5,327 members |
| Install | `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.12`; 5,327 files equal to the archive; smoke closed with 56 definitions |
| Builder | RC11 remains the pinned builder |
| Records | On the branch under `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/`: `LEDGER.md` (one row per package, and the list of authority-level text awaiting ratification), one Return per package, `DEMONSTRATION.md`, and the six review files under `reviews/` |

The archive holds `build/`, `contracts/`, the toolchain manifest, `package.json` and dependencies. Commits after the cut commit change tests, one design note and records, so they do not change the archive.

The build's worktrees were under `/private/tmp`. The untracked evidence the Returns cite is copied to `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01-evidence/` in the main checkout (117 MB, untracked): the live Run, the comparison run, the failure trace, the inactivity and heartbeat scratch, the suite and base outputs, and the memory measurements.

Sections 13 and 14 cite review files at temporary paths. The durable copies are `reviews/RV1_REVIEW.md` (section 13's review 2), `RV2_REVIEW.md` (review 3) and `RV4_REVIEW.md` (section 14's review 4). `RV3`, `RV5` and `RV6` are reported in 15.5.

### 15.2 What the candidate does

1. **Declared framed reviews.** A task declares its reviews. One assessor graph serves all of them; a review's type is its frame. Completion requires the acceptance verdict and every required review, satisfied and current. A verdict goes stale when a later admitted effect touches its subject or a declared input.
2. **Declared process prerequisites.** A Program names the reviews that must hold before a purpose is selected. An out-of-order choice is refused before the work is entered, and the Executive selects again.
3. **Recoverable step failure.** A step that fails with a declared class returns to the Executive in the same Run. The next selection sees the failed attempts, read from the event log. Failed steps count against the step limit. Every other failure stops the Run.
4. **Readable stops.** A Run that stops without completing reads back its disposition, its reason, the Result the stop came from, the root's last Result and the next lawful action. The start and continue commands print the same statement.
5. **Inactivity containment.** A silent worker is contained when its declared inactivity expires. A working agent CLI's status rows renew the lease and are not counted as progress.
6. **The amendment witness.** A test fixture: a small existing system, a process definition written once, and an amendment as the only per-task input.

Not in the candidate: the Consensus retirement (section 14) and the items section 11 lists as not in RC12.

### 15.3 The live demonstration

One Public start, frozen to the cut archive, on the amendment witness. The record is `DEMONSTRATION.md` on the branch.

| Measure | Governed Run | Bare model CLI, same amendment |
|---|---|---|
| Outcome | Completed on the first attempt; both required reviews satisfied and current | Equivalent one-line change; tests pass |
| Steps | 7 selected by the Executive: triage, impact assessment, impact review, construction, testing, preservation review, acceptance | 1 call |
| Agent calls | 14 | 1 |
| Elapsed | 566 s | 49 s |
| Reported cost | 9.21 USD | 0.34 USD |
| Tokens | 2,193,119 | 308,232 |

**What it did not show.** Nothing was refused and nothing failed during the live Run. Refusal of an out-of-order choice, an adverse review followed by correction, recovery from a worker failure, a stop on a write outside the grant and the step limit are proved by scripted Runs with a stand-in model on the same installed topology (`t287-amendment-witness`, 12 of 13 cases; the thirteenth is the live case). Every role ran on one model family, which the method's evaluation standard does not count as independent assessment. The candidate has no path for a human response during a Run.

**What it cost.** On a one-line change the governed Run cost 27 times as much and took 11.5 times as long as the bare CLI. Seven selection calls cost 2.87 USD of the 9.21. One observation of a small task says nothing about work that spans corrections, failures or sessions.

### 15.4 The whole suite

Run on the merged head before the pre-cut pass (`82ad6639b`): 1,396 tests, 1,142 pass, 18 fail, 236 skipped. The skips are environment gates.

| Failing file | Failures | At base `b7cf409fc` |
|---|---|---|
| `t287-single-address-space-consolidation` | 7 | Same 7 fail |
| `t287-route-reconstruction` | 2 | Same 2 fail |
| `t287-calculus-fold` (HS03) | 2 | Same 2 fail |
| `t287-governed-context` (GC03) | 1 | Fails. Its recipe pins STDO 3.0.2 standards; the project selects 3.0.4. Needs a ticket |
| `t287-framework-handoff-types` (exact014) | 1 | Fails |
| `witness-reprice-definition-binding` | 1 | Fails |
| `r1`, `r2`, `r3` | 3 | Fail at base on a stale candidate basis; all three pass on the cut build after the basis refresh |
| `t287-c0-post-publication-failure` | 1 (the file) | Passes 31 of 31 |

**The one file that passes at base is not a product regression.** The Executive first reported it to the owner as one, before the triage, and corrected that.

- The test process retains about 103 MB of heap per case at base and 104 MB on the candidate. The harness imports two fresh copies of the product for every case, and Node never unloads a module.
- At base the 31-case file passes under the default 4,288 MB heap limit and fails when the limit is lowered to 4,075 MB. The candidate's built code is 0.9% larger, which adds 21 MB by the last case, enough to fail.
- A host that imports the product once is not affected by this mechanism. 300 Public status reads over one stopped Run stayed flat after a 1.3 MB warm-up. A stopped Run carrying a large root Result was not measured.
- The 31 cases are now split across two files that run in separate processes (package M); no assertion changed. The Executive reran both on the merged head `083c96002` at the default heap: 16 of 16 and 15 of 15 pass. The Writer measured about 1.7 GB and 1.6 GB of heap at the end of each.

With that, no file fails on the candidate that passes at base. The whole suite was not rerun after the pre-cut pass; the commits since then were verified file by file.

### 15.5 Independent reviews RV3, RV5 and RV6

All reviewers are Claude Opus 5.5 at maximum effort in fresh contexts, the same model family as the authors. Every S1 and S2 finding has a disposition below. An S3 or S4 finding not named here has no recorded disposition and stays open; the review files list them.

| Review and subject | Verdict | Findings acted on | Left open |
|---|---|---|---|
| `RV3`: failed-child foldback (runtime half) and process prerequisites | Accept with repairs, both | A folded failed child read as `closed`: the Public read now gives the foldback's disposition. A closed Run showed folded frames as live: the Public reads omit ended frames. The selector's refusal was an untyped implementation exception: it has its own class, `missing-owned-select@5`, with three typed relations. Re-evaluation could not see the failure: the selection task carries the failed attempts. "Offered only permitted work" overclaimed: the Product sentence is "Only permitted work can be selected next". A task could silently waive a Program's prerequisite: a not-applicable declaration now needs a stated reason | A failure class is not proved to survive a fan-out or retry lift. The task author still decides applicability, and no authority is recorded for that decision. The prerequisite declaration is not checked at admission, so a malformed one is refused only at intake. No test pins that a consumer Program cannot invoke a library wrapper directly, which is what keeps the fixed Testing and acceptance route behind the prerequisites |
| `RV5`: readable-stops repairs and the heartbeat | Readable stops: changes requested (one green test turned red). Heartbeat: accept with repairs | The red test's expectations were corrected to the new reading. The ended-frame rule had two owners: `projectEndedChildFrames` in `replay.ts` is now the one owner. The repriced retry requirement stated a rule the code lacks: reworded to the code. The heartbeat evidence was unsound in the package: the Executive read the recorded archive and confirmed the status rows during compaction | No test separates causal origin from position; the added case is a regression guard only. The 60 s inactivity default still ends a working agent, so hosts must declare a longer value; the demonstration declared 300 s. The replay view digest covers liveness the Public reads now omit |
| `RV6`: recoverable step failure (library half) | Accept with repairs | Selector refusal relations described as built. An empty worker answer with a normal exit continued at the selector and stopped the Run at the worker: `native-work/no_output@5` is now recoverable by default, and the Product's stop list reads "among them" | The stop after a refused parent re-entry is truthful but reads as an encoded reference. A Testing actor that exits before its helper reads as an integrity stop |

### 15.6 Section 14's Product header line is not yet written

Section 14 said the Product header would gain the change authority for RC12's edits at the close. It was not written at the `rc.12` cut, and it cannot be added to `rc.12` now: the packaged contracts carry a mirror of the Product and intent files (`T/contracts/qualification/sources/`), so a header edit changes the archive. It goes into the next cut, in the header's existing form: `**Default-governance change authority**: direct Product-owner instruction, 2026-11-11, and [RC12 build record](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/LEDGER.md).`, with `**Updated**: 2026-11-11`.

### 15.7 Decisions: one answered by the owner, one open, the rest ruled from precedent

The owner asked, at the close, for the decisions that prior cases cannot answer. The Executive had listed four. Checked against the record, precedent answers them. Two others looked underivable: integration into `main`, which the owner then answered with a standing rule, and who runs the next round.

**Answered by the owner at the close.** The Executive asked whether RC12 is integrated into local `main`, because only RC9 had been integrated and RC10 and RC11 had not. Owner, 2026-11-11: "i thought RC9 established precedence, but it failed to do so, all worktrees are short lived are merged back to main and deleted". Done by the RC9 precedent (`rc9-main-integration-01`):

- Preservation commit `89ee06e15` commits, unchanged, the status blocks Codex had left uncommitted in `specification/GOALS.md` and the T-287 ticket.
- Two-parent merge `99e6085b0` of `claude/rc12-integration` at `34aafb2c6`. Every entry outside `.ai-workspace` and `GOALS.md` equals the RC12 head (1,891 entries, none differing). Every record of `main` is retained exactly and 34 records are added. The two conflicted records are restored from the preservation commit; they already hold later revisions of the incoming entries.
- The merge also brings the RC10 retention, RC11 qualification and RC11 foundation-correction lines, which the RC12 head contains.
- `f76847223` adds one status block at the top of `GOALS.md` and the ticket. It records the integration and states that no pin, qualification or next round is selected.
- Three idle RC12 worktrees are deleted after their cited evidence was copied out. The worktree running the final whole-suite run and the one running the read-only trace below are deleted when those finish. Codex's three worktrees (`codex/rc10-retention`, `codex/rc11-foundation-correction`, `codex/rc11-qualification`) are now merged into `main` but hold untracked directories (`.abiogenesis/`, `qualification-inputs/`, `qualification-scratch/`), so the Executive left them in place.

**For the owner.** Next steps. The owner said at the close that RC12 comes first and next steps are evaluated after it. The open question is who runs the next round: the owner gave this build to the Executive as a one-off, "in the interest of time and testing how good Fable 5.2 is", and named dogfooding as the purpose. The choices are the same Executive directly, Codex as Root, or the installed candidate's own Executive with the candidate pinned as builder. Every earlier pen change was the owner's explicit call.

Only the owner can tell Codex that its RC12 wait is over.

**Ruled from precedent.**

| Question | Ruling | Precedent |
|---|---|---|
| How One Surface is realized once Consensus is retired | Re-home the standard system program onto the Executive, then retire standalone Consensus with review 4's repairs. A read-only trace is running (branch `claude/rc13-one-surface`, Return `O1_TRACE.md`): it maps the four authorities `synthesizeModel`, `evalGap`, `evaluateNext` and `evaluateAction` onto the Executive's step as built and proposes the smallest re-homing. No construction starts before the owner's evaluation of next steps. A cut that contains it is `rc.13`, because the `rc.12` release and install directories are create-once | Owner: "consensus has been replaced by executive". The Product section "System And One Surface" already says "In 5.0, a required human response yields a truthful blocked handoff; native response/resume is 5.1", so no human-response path is needed. Section 14's rejected route removed the feature; this one keeps it |
| Ratifying the changed authority text | It stands under the owner's delegation for this build. The next cut records the change authority in the Product and intent headers (15.6). `LEDGER.md` lists every change: three new intent paragraphs, seven Product changes and four requirement changes covering seven requirement statements. The Executive read the whole specification difference against the base to make the list | Owner, 2026-11-11: "run from the precedences established, all your questions can be answered by my historical intent"; the header convention of earlier re-entries |
| Whether to qualify `rc.12` | No. The cut to qualify is the one with Consensus superseded. The qualification inventory and recipe predate RC12: none of the ten test files RC12 added is listed in either, and the package M Return names the members its split adds and changes | Owner, 2026-10-29: "i approve the recommendations, they are now the refactor plan". That plan qualified a repair cut, not the candidate it repaired, because a Product change makes a new cut |
| Whether to re-cut after the memory fix | No. The fix is test-only; no archive input has changed since the cut commit | Sixth amendment: unchanged code is not rechecked |
| The 60 s inactivity default (15.8, item 2) | A defect. The next package sets the default from the recorded evidence | Owner: always discharge technical debt |

### 15.8 Open findings

Ranked by their effect on the stated use, a person who cannot inspect the engineering amending a specification.

1. **The framework does not yet enforce all it states.** Writes outside the read roots are unobserved. An assessor can read beyond its declared material. A review subject is one file.
2. **A working agent can still be ended** at the 60 s inactivity default. A first response took 83.5 s in one recorded run.
3. **Assessment is not independent** while one model family serves every role.
4. **Governance has a fixed cost** that dominates a small task (15.3). The cost is the number of calls, not their size: the governed Run averaged about 157,000 tokens per call over 14 calls, against 308,232 for the single bare call. Where the tokens of a call go was not analysed.
5. **Readability gaps on stops.** The refused re-entry stop reads as an encoded reference; a Testing actor's early exit reads as an integrity stop; frames on a failed Run still report `continue_waiting`.
6. **Replay digests include derived liveness.** That blocks correcting the axioms, so RC12 corrected the readers instead.
7. **Verdict vocabulary** lacks out-of-frame and not-applicable. STDO sources reach the assessor as URI text only.
8. **The `gate` application** is declared, validated and accepted by the Public request schema. No code outside declaration, validation and type positions names it; the Executive found nothing that executes one. Checked by search, not by running a Program.
9. **Installing a product for a test peaks at about 0.93 GB of heap** per install. This predates RC12 and is not traced.
10. **Stale surroundings.** The runtime archive sits inside the worksite. `lint:evidence` is red on five committed oversize archives. The `exact014` handoff pin is superseded.

### 15.9 The Executive's errors in this build

1. Accepted a false review finding on Testing-command effects without running the code that produces the field; withdrawn (section 13).
2. Repriced a selected feature by rewording the One Surface sentences; backed out (section 14).
3. Ruled review currentness over too small a set; repaired after review 1 (section 8).
4. Proposed `re_enter` for failure recovery; the trace refuted it (section 10).
5. Gave the library half two rulings that contradicted each other; the Writer stopped and the rulings were replaced.
6. Reported the suite's memory failure to the owner as a product regression before the triage (15.4).
7. Left package A's Product paragraphs out of the ratification list until the close.
8. Estimated the package A repairs at 75 minutes; they took 2.6 hours. Recoverable failure landed 3.5 hours after its estimate.
