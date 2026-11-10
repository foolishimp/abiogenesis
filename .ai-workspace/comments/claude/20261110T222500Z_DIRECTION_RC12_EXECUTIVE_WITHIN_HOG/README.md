# Direction: RC12 — the Executive within HoG (owner proxy)

**Superseded on 2026-11-11** by `20261110T232000Z_PLAN_RC12_FEATURES_AND_PLAN_FOR_REVIEW`. The owner directed Claude to make the build directly as Executive, so Root is not asked to resume under this post.

Commentary, not law. Written by Claude as operator proxy for the owner, under the owner's instruction of 2026-11-11: "i want you to become human proxy driving the feature build". Proxy direction is an agent contribution. It selects bounded work inside the recorded RC12 intent (`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-operational-pin-01/RC12_INTENT.md`) and answers realization questions. It does not carry the owner's reserved authority: the decisions in section 5 wait for the owner's own words. This post activates nothing. Root resumes only on an owner instruction that names it.

## 1. The finding that sets the scope

The RC11 build used the installed builder for the Worker step only.

- The last RC11 call, `rc11-effect-phase2-01/native-b02/host.mjs`, binds the default library Program for setup, then selects the native work Program directly (`rootMode: 'direct'`, one `NativeWorkspaceWorkTask`), waits on stdin for Root's admission, and dispatches one worker call.
- Selection of the work, the reviews, the proof runs, the conjunction of findings and the acceptance were Root's. They sit beside the event log as files: `ROOT_SCOPE.json`, `ROOT_ADMISSION.json`, `FINAL_CONJUNCTION.md`, `ROOT_FINAL_ACCEPTANCE.json`. That one call directory holds about 40 operator-authored files.
- The in-framework Executive (`executive` and `executive-step` in `gtl/default_library.ts`) was last invoked in the RC4 round. No prepared or request file from RC5 through RC11 names it.

RC12 moves the Evaluator and Consequence steps of a build inside the framework. The Executive is the Consequence role under an executive reference frame, applied recursively (`specification/PRODUCT.md:1217`, `:760`). It chooses the next action and nothing else.

## 2. RC12 outcome and its one demonstration

On the installed RC12 candidate, one public invocation takes a real ABG source change with acceptance criteria.

1. The Executive selects the work and the reviewers.
2. A required reviewer returns an adverse finding.
3. The Executive selects the correction.
4. Only the reviews whose subject changed run again.
5. The Run closes on the required verdicts.
6. The host process is killed once mid-run, and a fresh process continues the same Run from the event log.

No Root decision file exists for any step inside the Run.

## 3. Feature list

| Id | Feature | Current state in RC11 |
|---|---|---|
| E1 | **The Executive drives a real build task.** One public invocation of the registered `executive` GraphFunction on an ABG source change, with no caller-side selection between steps. | Present, unused since RC4. Step 1 measures it before anything changes. |
| E2 | **Reviewer types are reference frames.** The task declares its reviews. Each names its frame, subject, criteria and whether it is required. One assessor graph serves all of them, and the selector chooses a review by name. Frames come from the task's declared basis; ABG adds no frame vocabulary. | `original.assessment` is single, and the only verdict that counts has purpose `uat` (`product/default_library.ts:134`). |
| E3 | **Completion requires every required verdict.** The deterministic parent test becomes: each required review has a satisfied verdict that is current for its unchanged subject. An adverse or missing required verdict keeps the Run open and is listed to the selector as unresolved. The Executive never selects completion. | The test reads only the last observation (`abg/default_library.ts:391`). |
| E4 | **Verdict currency and targeted re-review.** A verdict stops being current when its subject changes after its admission. Other verdicts stand. After a correction only the invalidated reviews run again. | The currency check exists for the single UAT verdict. |
| E5 | **A child failure is an observation, not the end of the Run.** A worker that hits its time ceiling, refuses or fails returns to the Executive as an attributed observation, with the work it left preserved. The selector chooses a narrower successor, a retry within the declared bound, or a gap. | Not traced. State the current behaviour before changing it. The RC11 build hit the 900-second ceiling three times, and Root chose each successor. |
| E6 | **Continuation after host loss, on the Executive path.** A fresh process continues the same Run from the event log. Admitted children are not run again. The next selection comes from admitted state. | Required by 5.0 for ordinary Runs; unproved on this path. Fix only if the proof is red. |
| E7 | **Explicit step limit.** The task declares the Executive's step limit. Reaching it yields a typed bounded outcome that names the unresolved obligations. | Default 12 (`gtl/default_library.ts:68`); the build host passed 8. |

Removal and census:

| Id | Item | Condition |
|---|---|---|
| X1 | **Standalone Consensus retired.** Product text first; then `gtl/consensus.ts` (5,267 lines), its implementation, schema, vocabularies, tests, designs and `REQ-P-CONSENSUS.md`, as the last RC12 package. | Owner decision D1. |
| X2 | **Census of the choice mechanisms.** Read-only: `registered_selection`, `gate` and the `consequence` term of `C.edge`. Report what one primitive would own, the lines it would delete and the contracts it would change. | No code change in RC12 without owner decision D3. |

Measures recorded once, at the demonstration: Root decision files per accepted change (target zero inside the Run), operator-authored files per invocation, elapsed time and provider cost per Executive step, and selector prompt bytes (the RC3 round overflowed the 1 MiB bound once).

Outside RC12: human response with same-run resume, same-edge yield, the tuner, further host adapters, the HTTP and worker refactors unless E5 shows the worker capture owner is on the path, reviewers run in parallel, and authoring the task declaration from a short brief.

## 4. Order of work

0. **Base.** RC12 source starts from the accepted Phase 2 source `b7cf409fc`, not from the RC11 archive source `e2ba05da5`. The builder stays the immutable installed RC11.
1. **Baseline on installed RC11, before any change.** Give the registered `executive` one small real task through one public invocation. E7 is the candidate: it is the smallest RC12 item with executable tests. No Root selection inside the Run. One Run, no repair of RC11, stop at the first non-pass. Return the selections made, where it stopped and why, elapsed time, cost, prompt bytes and the files the operator had to author.
   - If the Run closes, later packages go through the Executive.
   - Where it stops, that package uses the direct worker route, and the stop is recorded as an RC12 defect under the matching feature.
2. **E2 with E3**, as one package: the declaration and the completion test are one contract change. Thread: two required reviews with different frames, one adverse, and the Run stays open.
3. **E4**, then **E5**.
4. **E6** proof. **E7** if step 1 did not deliver it.
5. **X2** census at any point after step 1. **X1** after D1.
6. **Cut, install, and run the section 2 demonstration once** on the installed candidate. Broad suites and independent review run here, once.

Each package has one activation, one return and one status line. Unit lanes cover new atoms only.

## 5. Owner decisions

These are reserved. The recommendation is the proxy's.

| Id | Decision | Recommendation |
|---|---|---|
| D1 | Retire standalone Consensus in the Product: the Consensus section, F08, S05, the boundary row and `REQ-P-CONSENSUS.md`. This is a product reprice. | Yes. Text first, deletion as X1. |
| D2 | Change the governance work-state contract from one assessment to declared reviews, with the new completion test. E2 and E3 need it. | Yes. The RC contracts are unqualified and unpublished. |
| D3 | Fold registered selection into the consequence route. This is a design reframe. | Decide on the X2 census. |
| D4 | Merge `codex/rc11-foundation-correction` into local `main` before RC12 work. It is seven commits ahead; `main` adds one review post. | Yes. No push. |

RC12 ends at a local cut, as RC11 did. Publication and push are not selected.

## 6. How the proxy works

The proxy answers Root's scope and realization questions and reviews each return at package close. It stops for the owner at Product text, a public contract change beyond D2, a new failure class, a design reframe, publication or push. Spend follows the owner's R&D direction of 2026-11-01, with actual costs recorded. Direction is posted in this directory. Root's returns stay in the T-287 work root.
