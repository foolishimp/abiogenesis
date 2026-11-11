# RV6 review: RC12 B2b, recoverable step failure (library half)

**Subject.** `92536a383` (Product, design) and `173b2b99d` (code, tests), worktree `/private/tmp/abg-rc12-witness-20261111` at `2839faa1a`.
- The merges `b99709fa3` and `a87bf8838` are not reviewed.
- Code paths are under `build_tenants/abiogenesis/typescript/code/src`; test paths are under `…/test_env/tests`.
- This is an independent review: I made no repairs. I share a model family (Claude) with the authors.

## Product Frame

- **5.0 set.** The fixed fifteen-family Product (PRODUCT.md:1169, :1350ff). Wave GOAL-035 (GOALS.md:98), T-287 RC12, package B2b. Slice: default governance library, recoverable step failure (PRODUCT.md:1139-1144), under A5-F04/F07/F10/F17 and REQ-L-GTL3-RECURSE-007.
- **Outcome.** The Executive chooses only permitted next steps. A routine agent failure returns to the Executive in the same Run, and the attempt is visible. An integrity failure stops the Run truthfully. Failed steps consume the declared limit.
- **Authority.** Product and requirements say WHAT; the GTL recurse member is immutable Program authority. HoG traverses and lifts. ABG admits events, and the log is the recovery source. Parent evaluation and selection preparation are F_D constructions re-derived at admission. The selector is F_P, and the transport classifies process outcomes.
- **Prohibitions.** No hidden controller, second runtime, or Executive loop outside the recursion. No typed outcome is erased into a flag (PRODUCT.md:450-453). No fact is kept beside the log, so no failure row enters the work state. Judgment never waives prerequisites, permissions or completion.
- **Classification.** The class list is an immutable definition. The step reading and the fold are pure projections over the admitted prefix. Parent re-entry and the selection task are deterministic constructions. The selector refusal is an F_P observation through the existing refusal report. Nothing new is added: no event kind, store, ledger or runtime entity.

## Verdict

**Accept with repairs.** No failure continues that should stop.
- A write outside the grant (W4, both paths), a selector tool call, an identity mismatch and a deterministic origin all stop the Run.
- With two failures in a row, the parent reads the right step (probe `consecutive`). Its refusal reads back as a failed stop.
- Nothing blocks the cut or the live demonstration. The most important repair is the F2 decision: one transport class (`no_output`) continues at the selector and stops the Run at the worker. F2 rises to S2 if the provider CLI exits 0 on an `is_error` result, which is not verified.
- F1 is a text and test repair with no runtime effect.

## Findings

**F1 (S3). The selector refusal relations do not cover what the design and the doc comment say.**
- **Rejected claims.** The design ("Typed handoffs"): "`response_refused` … including tool calls and non-I-JSON output". `implementation/default_library.ts:104-108`: "the selector's process ended without success".
- **Evidence.** Probe `select-malformed`: a schema-invalid answer with exit 0 folds back as `selector_process_ended` `{failureClass: contract_failure}`, and the Run completes. The transport rejects that output before completion (`abg/actor_process.ts:1273-1285`, `abg/transport_contracts.ts:121`). `complete` therefore takes the non-success branch (`implementation/default_library.ts:122-123`). Probe `select-tooluse`: a closed-lane tool call never reaches `complete`. The Run ends `run_stopped`, `blocked`, `c-call/evidence-contract-mismatch@5` (`abg/c_call.ts:6728`). The `toolCallCount`/I-JSON branch (:126) and `t287-default-library-recoverable-failure.test.mjs:167-168` hold only on a stubbed `disposition:'success'` exchange. The closed lane never delivers one.
- **Boundary.** The F_P observation, its typed relation, and the selector view.
- **Sunny-day effect.** None; the Run continues either way. The selector does see a malformed answer as "process ended".
- **Repair (~1 h).** Describe the relations as built: `selector_process_ended` means the transport reported the exchange failed (any `failureClass`); `response_refused` means the binder refused a contract-valid answer. Replace :167-168 with transport-classified cases, or delete the dead branch. Rename the relation only if the owner wants the name exact.

**F2 (S3, owner decision). Routine native failures outside the default list stop the Run, and the Product's stop list reads as exhaustive.**
- **Rejected claim.** PRODUCT.md:1142-1144 names four stop causes. This conflicts with the owner standard that a routine agent failure needs no human coordinator.
- **Evidence.** Probe `worker-errorresult`: the construction worker exits 0 with an `is_error` result and empty output. The Run ends `runtime_failed` (`runtime_failure_observed`, route, `native-work/no_output@5`). Its failure Result carries `after` (`implementation/native_workspace_work.ts:66-82`), so the parent check would accept it if the class were declared (code reading). Probe `select-errorresult`: the same output at the selector continues as `selector_process_ended` `{failureClass: no_output}`, and the Run completes. The same class continues at one leaf and stops at the other. `result_contract_failure` (`native_workspace_work.ts:74`) is also undeclared; not probed. The census offered `no_output` as "excluded unless you rule otherwise" (`B2B_RETURN.md:64`), so the list is a ruling.
- **Boundary.** The default list (`product/default_library.ts:29-30`) against the Product paragraph.
- **Sunny-day effect.** None, unless a worker turn ends with an empty report and exit 0.
- **Repair (30–60 min).** One of: declare `native-work/no_output@5` (and `result_contract_failure`) by default, which moves the R7 pins again; add one Product sentence: "Only declared classes return; by default native-work and assessment transport or contract failures, and refused selections."

**F3 (S4). The parent re-entry stop is truthful but unreadable.**
- **Truthful.** The readback probe (W4a scenario) shows: `run_stopped` `failed` and a start `stopStatement`; cold `run_status` `failed`, with a stop reading (`eventKind run_stopped`, `nextActions []`); `run_replay` `failed`, and `run_result` refusing with `not_found`.
- **Unreadable.** `reasonRef`, the origin `diagnosticRef` and the statement's "Reason:" are a percent-encoded `data:` URI. The origin is the executive's own refusal Result ("class not admitted"), not the failed step. With exit 0, the same breach reads `…/write_scope_violation@5`.
- **Return wording.** `B2B2_RETURN.md:131` ("no `runtime_failure_observed`") is true, but the stop event is `run_stopped`.
- **Repair.** The stop-reading owner (RR) renders a `data:` diagnostic as its class, relation and selectors.

**F4 (S4). Tests weaker than their names.**
- Test 4 stubs `boundBasis:{}`, so the binder always returns null (`product/default_library.ts:492`).
- Parent relations other than `failure_write_outside_grant` are proved only over mutated records (test 3).
- Stale comments remain at prerequisites :52-56, reviews :51-54, and in the foldback test title (B2B2_RETURN:133).

**F5 (S4). View row wording.** `product/default_library.ts:483` says "(null when no choice was admitted)". A `target_not_permitted` row still names the refused target (W1: `construction@5`). Say "chose or proposed".

**F6 (S4, outside the subject). A Testing actor exit reads as an integrity stop.** Probe `c2-exit`: a Testing actor that exits before its helper stops the Run on the existing C2 class `worksite/command-execution/transport-identity-mismatch@5`. Declaring that class would be wrong. A provider hiccup in Testing therefore reads as an integrity stop.

## Answers

- **Q1. None found.** An identity mismatch throws (`implementation/default_library.ts:116-117`) and becomes undeclared `implementation-exception`, so the route stops. If a consumer declares it, the parent refuses (`abg/default_library.ts:195-198`). Unattributable native effects are refused (:213-214). A deterministic origin stops at the route, or is refused at :208-209 if declared. C2 failures and intake refusals are undeclared. A selector tool call stops at evidence admission. An unconfirmed selector termination has no `actor_invocation_failed`, so it is refused (:200-202).
- **Q2. These continue, each with the right row:** worker exit (W2); inactivity (W3, `timeoutClass: inactivity`); refused report (probe `worker-malformed`); assessor exit (probe; the row carries `reviewRef`, and the review is re-selected and passes); out-of-order choice (W1); selector exit (probe `select-always`). A worker `no_output` stops (F2). The absolute ceiling was not run.
- **Q3.** The parent reads only the last recursion foldback of its Run and basis (:527, :228-231). It descends through the last failed child before each failure (:178-184), at most 8 levels. It takes effects from `after`, unknown-effect facts and write roots. Probe `consecutive` (exit after a partial write, then a write outside the grant): the first step continues, and the selector sees `changedPaths [src/order.mjs]`. The parent then refuses with `failure_write_outside_grant`. Its `failureResultRef` is the second foldback's `childResultRef` (`9b7d7ae0…`), not the first's (`8d261921…`). The runId filter excludes retained Runs (code reading only). Admission re-derives the check over the same prefix (:578-581).
- **Q4.** The fold is pure and runs at preparation (:234-254). Nothing enters the state. With no failed step it is absent (:253; view :483; evidence :286). `changedPaths` is shown (W2). Currentness counts failure Results (`abg/native_worksite_execution.ts:271-283`). W2 asserts that the touched review is not current.
- **Q5.** No new event kind; the relation names are wrong (F1). The tool-call grouping makes no defect recoverable, because a tool call stops earlier. Probe `select-always` at bound 4: 3 failed steps, then `run_stopped` `bound-exhausted` `blocked`.
- **Q6.** Every failed step consumes one recursion step, whatever its class (W5, probes). The Run ends blocked, never at completion. No stationary-failure stop comes before the bound (default 12; cf. REQ-R-ABG3-RETRY-006). R6 rules this, but a live Run can spend bound−1 failed attempts.
- **Q7.** Rebuilding from the library changes the executive definition and digest, and turns recovery on. The other graphs are unchanged (test 1 :40-42). Registered Programs keep their bytes and still stop. `[]` reproduces the pre-subject pins: `ac6f1ba5…`, `235f8c59…`, `d29a3c03…`, `6ded5137…` and `e7df59cd…` all occur in the `f7b039ffb` tests. Test 1 and the readable-stops cases pin it. The module publication always takes the default (`gtl/default_library.ts:294-295`).
- **Q8. No bypass.** The schema enum offers only permitted graphs (`product/default_library.ts:519`). The binder rechecks (:508). Failure refs are citable only (:286). They never become a subject or a review standing.
- **Q9.** The four stop causes hold (W4 with readback; unit mutations; route or origin refusals), but the list is not exhaustive (F2). The design's `response_refused` sentence is wrong (F1). Otherwise the text is accurate and in the present tense.
- **Q10.** The new tests would fail before the subject (new exports and recovery). I reasoned this; I did not run it. Weaker tests are listed under F4. W1–W6 prove the plumbing on the installed topology. They do not show a real model adapting, because the stand-in avoids refused targets by script, nor how real CLI failures map. The identity-mismatch proof is real by composition: the unit throw; test 1 (`implementation-exception` undeclared); `t287-runtime-failure-diagnostic.test.mjs:456` (a thrown F_P completion becomes `implementation-exception@5`); the census installed run, where the same throw stopped at the route.
- **Q11.** The sunny day has no failed step, so task and prompt bytes are unchanged; the Program digest changed. The CLI exit code on `is_error` is unverified (F2). A selector tool call stops `blocked` with a typed reason (existing behaviour). Repeated failures cost up to the bound (Q6). F3 and F6 also apply. A fresh build rewrites 27 tracked contract files (existing drift); regenerate them at the cut.

## What I ran

All runs used TMPDIR=/private/tmp/abg-rv6-tmp at load 7–18.

- **Build.** `npm run build`: ok, 32 s. It rewrote 27 tracked generated files (`contracts/**`, `product-toolchain-manifest.json`). I restored them with `git checkout --`; `git status --short` is empty at `2839faa1a`.
- **Unit.** `t287-default-library-recoverable-failure.test.mjs`: 4/4 pass, 124 s.
- **Witness.** `t287-amendment-witness.test.mjs` W1–W6: 6/6 pass, 716 s (W1 114 s, W2 124 s, W3 152 s, W4 132 s, W5 63 s, W6 130 s).
- **Probes.** All ran on the installed witness topology, with a wrapper actor over the subject's stand-in. All passed; no timing-sensitive red occurred.

| Probe | Outcome | Detail |
|---|---|---|
| assessor-exit | completed | 1 failed step |
| worker-malformed | completed | 1 failed step |
| worker-errorresult | runtime_failed | `no_output` |
| select-errorresult | completed | `no_output` row |
| select-malformed | completed | `contract_failure` row |
| select-tooluse | blocked | evidence-contract-mismatch |
| select-always (bound 4) | blocked | 3 failed steps |
| c2-exit | runtime_failed | C2 identity class |
| consecutive (exit, then scope) | runtime_failed | 2 failed steps; the refusal names the second |
| readback of W4a | failed | `run_stopped`; stop reading present |

## Not checked

- The absolute ceiling with recovery on.
- `result_contract_failure`.
- Continuation of a stopped or blocked Run, and retained Runs.
- Fulfillment mode, including failure refs as obligation evidence.
- Consumer-renamed node refs, and nesting deeper than 8.
- Writes outside the worksite.
- Real provider CLI behaviour.
- The pre-subject state (not run).
- The merged branches.
- `run_lawful_actions`: my read call was malformed. The stop reading gave `nextActions []`.
