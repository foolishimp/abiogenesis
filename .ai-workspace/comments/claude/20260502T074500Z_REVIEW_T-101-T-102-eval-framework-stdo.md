---
kind: claude_post
category: code_review
governing_method: STDO + DESIGN_MODULE_METHOD
subject: T-101 T-102 ABG eval-suite projection and mini data-mapper redux pre-closure review
posted_by: claude
posted_at: 2026-05-02T07:45:00Z
scope: read-only review; no source modified
external_source: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
---

## 1. Position

Both T-101 and T-102 are ratifiable. T-102 is the cleaner of the two: `eval_suite.ts` is a pure projection module that respects the F_P/F_D constitutional rule by structural means and operationalises the Anthropic decomposition (suite → task → trial → outcome → grade vector → aggregate) without inventing rival vocabulary. It composes T-082/T-100 cleanly and adds no rival authority. T-101 is also fine; it does not undo the recently-built mini-dm-redux per-edge surface, and the new sandbox emissions in `test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs` correctly attribute the per-obligation rows as `F_P` and only the envelope row as `F_D`.

The framework deliberately chose Boolean `passAtK`/`passAllK` rather than the Anthropic probability-style `1 - (1 - p)^k`. Given the suite is currently passAllK=true at k=3, this is acceptable for now, but should be promoted to a numeric pass-rate-at-k once a non-saturated capability suite needs it. Single load-bearing recommendation: ratify both with the closure recommendations in §12, and follow up on the items in §13.

## 2. Build/test status

| Check | Exit code | Counts |
| --- | --- | --- |
| `npm run lint:semantic` | 0 | n/a |
| `npm run lint:test-harness` | 0 | n/a |
| `npm run build:semantic` | 0 | n/a |
| `npm run test:t102` | 0 | unit 6/6 + sandbox 1/1 |
| `npm run test:t101` | 0 | 1/1 |
| `npm run test:t100` | 0 | unit + sandbox |
| `npm run test:semantic` | 0 | 324/324 |
| `T100_MINI_SANDBOX_REPEAT=3 npm run test:t100:sandbox` | 0 | 1/1 |

Note: `test:semantic` is at 324/324, not the 321/321 the operator reported — three additional tests have landed since the operator's snapshot. All green.

`eval_aggregate_projection.json` from the k=3 run (excerpt):

```json
{
  "kind": "eval_aggregate_projection",
  "trialCount": 3,
  "passedTrialCount": 3,
  "failedTrialCount": 0,
  "unknownTrialCount": 0,
  "passAtK": true,
  "passAllK": true,
  "passRate": 1,
  "passThreshold": 1,
  "gradeRowCount": 33,
  "gradePassCount": 33,
  "gradeFailCount": 0,
  "failureClasses": [],
  "verdict": "passed"
}
```

`gradeRowCount=33` = 3 trials × (1 F_D envelope row + 10 F_P per-obligation rows). Trial roots are isolated under `test_runs/t100_mini_data_mapper_lifecycle/<suiteTimestamp>/trials/trial-001..003/`.

## 3. Findings register

| Sev | Area | Claim | Evidence | Anchor | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Medium | passAtK / passAllK shape | Both metrics are Boolean, not probability/rate. `passAtK = passedTrialCount > 0` and `passAllK = trialCount > 0 && passedTrialCount === trialCount`. There is no `passAtKRate` (e.g., 1 − (1 − p)^k expectation) or `consistencyRate` field. Anthropic's framing for capability evals expects a probabilistic estimate over k, not a boolean. | `eval_suite.ts:429-430` | Anthropic Step 5 (probabilistic sampling), design summary "G2" | Add `passAtKRate` (= passRate computed empirically, identical to existing `passRate`) and document explicitly that `passAtK`/`passAllK` are Boolean indicators. Or rename to `anyTrialPassed`/`allTrialsPassed` to avoid suggesting the probabilistic interpretation. |
| Medium | Per-task aggregation | The aggregate folds across all trials of a suite. There is no per-task pass@k breakdown when `taskRefs.length > 1`. Today the sandbox uses a single task so this is moot, but the carrier shape will not surface per-edge variance for a multi-task suite. | `eval_suite.ts:336-457`; `taskRefs` is a flat list, no per-task aggregation map | design summary G2 ("per-edge AND aggregate-run-level") | Either add a `perTask: readonly { taskRef, passedTrialCount, ... }[]` field, or document that current sandboxes are single-task. The carrier should not silently flatten per-task variance once multi-task suites land. |
| Medium | Saturation indicator absent | Closure law for T-102 (`saturationPolicy: string`) is a free-form string. `EvalSuiteSpec` carries the policy text, but no derived `saturationStatus` is projected by the aggregate. With passRate=1.0 and passAllK=true the run is silently saturated; the aggregate does not distinguish "5/5 passed against a hard problem" from "5/5 passed against a regression already pinned green". | `eval_suite.ts:28, 95-116`; `deriveEvalAggregateProjection` returns no saturation field | Anthropic Step 7 / design summary G4 | Add a derived `saturationSignal: "informative" | "saturated"` field on the aggregate, computed from `suiteClass === "regression" || (passAllK && trialCount >= passingTrialFloor)`, or document in `saturationPolicy` semantics. Operator visibility into saturation is the load-bearing reason for repeated-trial reporting; today it has to be inferred from `passAllK` plus `suiteClass`. |
| Medium | F_P verdict policy doc | `EvalGradeVector.verdict` is "fail" if any row fails, else "unknown" if any row unknown, else "pass" — applied to the joint F_D + F_P row set. This means an F_D fail can mark a trial failed even though all F_P rows are pass. That's correct as a gating semantics, but is not documented. The constitutional rule says F_D never owns semantic authority; F_D failure correctly does not turn a passing F_P into a fail (it's still F_P=pass), and a failing F_D correctly fails the trial because the envelope is broken. The aggregate derivation also requires `outcome.passed && gradeVector.verdict === "pass"` for `passedTrialCount`; this is correctly conjunctive. | `eval_suite.ts:321-326`, `:412-419` | F_P/F_D constitutional rule, `feedback_fp_fd_boundary.md` | Add a brief comment near `eval_suite.ts:321` explaining that mixing F_D + F_P rows at the vector level is a gating composition, not a substitution: F_D can fail-out an envelope while F_P retains semantic authority over per-obligation rows. |
| Low | `taskRefs` deep-immutability | `EvalAggregateProjection.taskRefs` is built as `freezeStringArray(input.suite.taskRefs)` which copies and freezes, but the `EvalSuiteSpec` already froze it. Double-freeze is harmless; the (very minor) cost is allocation, but the consistency is fine. | `eval_suite.ts:441` | FP rigor | Cosmetic; reuse `input.suite.taskRefs` directly. |
| Low | `EvalGradeStatus` admits "unknown" but `EvalAggregateVerdict` is binary | Trial-level grade vector can be unknown (intermediate), but aggregate verdict is only `passed`/`failed`. An aggregate with all `unknownTrialCount` becomes `failed`. That's defensible (closed-world fail-safe) but not explicit. | `eval_suite.ts:14, 15`, `:431-434` | fail-closed | Add a comment that `unknownTrialCount > 0` always yields `verdict = "failed"` per fail-closed closure law. |
| Low | `review_sample.md` is full-population, not sampled | The review surface lists every trial's transcript ref. For k=3 this is fine; for k=20 the file becomes a giant directory listing rather than a "sample". | sandbox test `test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs:1164-1189` | Anthropic Step 6 ("Read transcripts regularly… sample") | When repeat counts grow, switch to a fail-biased sample (all failures + min(N, 3) random passes). Acceptable for current k≤3. |
| Low | Sandbox emits `failureClass: "contract_failure"` for any non-passed outcome | When the trial fails, `failureClass` is hard-coded to `contract_failure` regardless of actual failure mode (e.g., a runtime_unavailable would still be marked contract_failure). | `test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs:982` | runtime failure-class taxonomy (T-035) | Map foldback decision / outer evaluation to a real `RuntimeFailureClass` value. Today this is dead-code because the trial always passes. |
| Low | T-101 ticket lists `npm run test:t101:edge1/2/3/full/gaps` as acceptance criteria but ticket marks observed verification as only `npm run test:t101 1/1` | The ticket's acceptance criteria expand the surface beyond what the latest verification block records. The package.json shows `test:t101` only; per-edge variants live in run.mjs invocation. | T-101 ticket lines 56-60; package.json | ticket hygiene | Either add the `test:t101:edge1`-style scripts to `package.json`, or document in the ticket that the per-edge runs are operator-driven via `node run.mjs --edge ...` (which they currently are). The acceptance text reads as if there were npm scripts. |
| Note | `EvalGradeRow.regime` reuses `RuntimeRegime` | Good — no new vocabulary invented. `regime: "F_D" | "F_P" | "F_H"` is the already-canonical regime enum from `carriers.ts:9`. | `eval_suite.ts:78` | constitutional vocabulary | Keep. This is the right shape; F_H is reserved for future human-grader rows. |
| Note | T-102 ticket frontmatter missing T-101 in `dependencies` direction | T-101 ticket cites T-082, T-100 only. T-102 ticket cites T-082, T-100, T-101. The bidirectional cross-reference is partial. | T-101 ticket lines 16-18; T-102 ticket lines 16-19 | STDO ticket pair pattern | T-101's `dependencies` should add `T-102 active eval projection` once T-101 actually consumes the eval-suite carriers (the sandbox does, so this is now true). Or T-101 adds a `related_tickets:` block citing T-102. Today the link is one-way. |

## 4. F_P / F_D boundary audit

The constitutional rule (`F_D never reads content semantically; semantic judgment is F_P regardless of implementation type`) is **preserved** by the implementation. Specific evidence:

1. **Carrier-level enforcement.** `EvalGradeRow.regime` is the canonical `RuntimeRegime` enum (`eval_suite.ts:78`), not a free-form string. Each row carries explicit regime; mixing is by row, not by field. There is no "deterministic grader" field that secretly does semantic work.

2. **F_D row scope in the sandbox.** `test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs:984-987` defines `fdMechanicalPassed` as exactly three predicates: `materializedOutputRefs.length === REQUESTED_OUTPUTS.length` && `allocatedOutputRefs.length === REQUESTED_OUTPUTS.length` && `emitted.length > 0`. Pure envelope counting. No file-content reading. The detail string at `:1023` says so plainly: `"F_D mechanical envelope covers event emission plus allocated output materialization count only"`.

3. **F_P row scope in the sandbox.** `test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs:988-1007` builds one F_P row per schedule item, with `regime: "F_P"`, `obligationRef: item.obligationId`, and status from the per-obligation `assessment.status` admitted via `admitScheduledSliceAssessment`. The semantic judgment lives in `domainQualityAssessDesignRequirement` at `:439-467` which reads the design markdown and checks `markerObserved && acceptanceObserved && bodyObserved`. That is content-semantic, and it is correctly tagged `F_P` (not "code-based F_D" — exactly the strengthening note in the design summary).

4. **Aggregate composition.** `deriveEvalAggregateProjection` at `eval_suite.ts:412-419` requires `outcome.passed && gradeVector.verdict === "pass"` for a passing trial. F_D failure can fail-out a trial (envelope broken), but F_P pass cannot be substituted by F_D pass — both must be `pass` to count. This is conjunctive gating, not regime substitution.

5. **Test pinning the rule.** `test_t102_eval_suite_projection_unit.test.mjs:168-183` ("T-102 passed outcome with failing F_P grade remains a failed trial") explicitly asserts that an F_D-passing outcome with a failing F_P row produces `failedTrialCount=1`. This is the load-bearing test against the B-003/B-013/B-014/B-016/B-017 bug class. It passes.

6. **Mini-dm-redux F_D path stays mechanical.** `mini_dm_redux/run.mjs:438-444` invokes `evaluateFdEnvelope` only with envelope inputs (path, allocation, manifest, expected digest). The F_P call at `:447-457` invokes `evaluateEdgeArtifact` with the artifact path AND prior-implementation path AND invocation log path — content access lives entirely on the F_P path. Boundary is clean per the recently-built sandbox structure.

The boundary is enforced by **naming + carrier types + per-row gating**, not by an exhaustive type predicate. A reviewer could still pass an F_P-shaped check while labeling the row `regime: "F_D"`. The first defense is the pinning test plus the `feedback_fp_fd_boundary.md` rule. The carrier could be tightened further by splitting `EvalGradeRow` into a closed sum of `FdMechanicalRow | FpSemanticRow | FhAdjudicationRow`, with the F_D variant disallowing `obligationRef` (currently F_D in the sandbox correctly uses `obligationRef: null`, F_P correctly uses non-null — convention, not enforced). See §13 advisory.

## 5. Anthropic vocabulary mapping

The implementation maps cleanly to the design summary table:

| Anthropic | Implementation | File:line |
| --- | --- | --- |
| Suite | `EvalSuiteSpec` | `eval_suite.ts:17-29` |
| Task (= graph-function edge or full traversal) | `EvalTask` with `graphFunctionRef` + `edgeRef` | `eval_suite.ts:31-42` |
| Transcript / Trace (= event stream + lineage) | `EvalTrial.eventStreamRef` + `transcriptRefs[]` | `eval_suite.ts:44-57` |
| Outcome (= admitted ledger + materialized assets at terminal) | `EvalOutcome.materializedOutputRefs` + `admittedEvidenceRefs` + `foldbackRef` + `terminalDecision` | `eval_suite.ts:59-71` |
| Grader (= F_P semantic + F_D mechanical envelope) | `EvalGradeRow.regime` ∈ {F_D, F_P, F_H} | `eval_suite.ts:73-84` |
| pass@k | `passAtK: boolean` (any-trial-passed) | `eval_suite.ts:106` |
| pass^k | `passAllK: boolean` (all-trials-passed) | `eval_suite.ts:107` |
| Reference solution | `EvalTask.referenceSolutionRefs` | `eval_suite.ts:39` |
| Capability vs regression | `EvalSuiteClass: "capability" | "regression"` | `eval_suite.ts:13` |
| Saturation policy | `EvalSuiteSpec.saturationPolicy: string` | `eval_suite.ts:28` |

No invented rival vocabulary. The names are Anthropic's directly. The only place the implementation diverges is the boolean rather than probabilistic shape of pass@k/pass^k (see §6). No "deterministic grader" field smuggling F_D into semantic territory. Good.

The strengthening note from the design summary ("F_D corresponds to Anthropic's code-based grader **only when the grader is mechanical envelope check**") is honored at the carrier-population site rather than at the type level — implicit in the sandbox's labeling. This is acceptable; the constitutional rule is enforced by review and tests, not by the type system.

## 6. pass@k / pass^k correctness

**Math.** The implementation defines `passAtK := passedTrialCount > 0` and `passAllK := trialCount > 0 && passedTrialCount === trialCount` (`eval_suite.ts:429-430`). These are **empirical Boolean indicators** over the executed trials, not probability estimates.

The strict Anthropic framing for pass@k is the probability that at least one of k attempts succeeds, which for independent trials with empirical pass rate p is `1 − (1 − p)^k` (or empirically, `passedTrialCount / k`). For pass^k the strict reading is `p^k` or empirically the consistency rate. The implementation **does not compute these as probabilities**. Instead it computes:
- Boolean "any trial passed" → close to a 0/1 quantization of pass@k
- `passRate = passedTrialCount / trialCount` is the empirical pass rate at the trial level
- Boolean "all trials passed" → consistency indicator

`passRate` is the load-bearing numeric. `passAtK`/`passAllK` are Boolean projections of it (`passAtK ⇔ passRate > 0`, `passAllK ⇔ passRate === 1`). For a true probabilistic pass@k estimator, the right field would be `passRate` itself, scaled by `k`.

**This is acceptable but underspecified.** The Boolean shape is what the operator's report and ticket non-closure conditions actually require ("pass@k/pass^k in test_runs evidence"). The `passRate` field is present and gives the empirical estimate. But naming both `passAtK` and `passAllK` as Booleans risks a future reader expecting probability values. Recommendation in §3 finding row 1.

**Trial isolation.** Per Anthropic Step 4 ("robust isolated environments"), each trial must use fresh allocation roots. Verified:

- Sandbox at `test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs:1120-1131` iterates `for trialIndex in 0..k` and passes `trialRoot: path.join(suiteRoot, "trials", trialLabel(trialIndex))` to each `runMiniDataMapperTrial`.
- Inside `runMiniDataMapperTrial:500-505`, `runRoot = input.trialRoot`, `workspaceRoot = path.join(runRoot, "workspace")`, etc. Each trial has its own workspace.
- `basis.runId = run://t100/mini-data-mapper/${timestamp}` where `timestamp` includes `trialLabel(trialIndex)` (`:501`). T-082 allocation roots derive from runId; trials therefore get disjoint allocation roots by construction.
- Verified empirically: the k=3 run wrote to `trials/trial-001/`, `trials/trial-002/`, `trials/trial-003/` directories, each with full workspace + runtime + projections.
- The transform seed is `${transformSeed()}:${trialLabel(input.trialIndex)}` (`:676`), so each trial draws from a different random sequence (still deterministic per trial label).

**Per-edge / aggregate-run reporting.** The current sandbox uses a single task ("requirements-to-design"). The aggregate reports run-level pass@k / pass^k. There is no per-edge breakdown because there is one edge. Multi-task suites would need a per-task projection field — see §3 finding row 2.

**Verdict:** pass@k/pass^k correctness is acceptable but Boolean-only. Trial isolation is correct.

## 7. Pure projection audit

`eval_suite.ts` is a pure projection module:

1. **No I/O.** No `fs.*`, no `Date.now()`, no `crypto.*`, no `process.*`. Confirmed by reading lines 1-458 in full.
2. **Closed sums.** `EvalSuiteClass = "capability" | "regression"` (`:13`); `EvalGradeStatus = "pass" | "fail" | "unknown"` (`:14`); `EvalAggregateVerdict = "passed" | "failed"` (`:15`); `RuntimeRegime` reused (`:78`); `RuntimeFailureClass` reused (`:70, :114`). All closed.
3. **Frozen carriers.** Every constructor calls `Object.freeze(...)` at return. Arrays go through `freezeStringArray` from `runtime_support.ts:13-15`. Grade rows go through `freezeGradeRows` (`:131-152`).
4. **Fail-closed validation.** Constructors throw `TypeError` on invalid inputs (empty strings, empty required arrays, out-of-range rates, duplicate refs, lineage mismatches). The behavior is consistent with the rest of the M03 contract surface (cf. `output_allocation.ts` style). Tests pin the throws: `test_t102_eval_suite_projection_unit.test.mjs:185-225` covers grade-vector lineage mismatch and duplicate-outcome fail-closed.
5. **Effects isolated.** All file writes, `Date.now()` calls, and `crypto.createHash` calls live in the sandbox harness `test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs`, not in `eval_suite.ts`.
6. **Determinism.** `deriveEvalAggregateProjection` is a total function of its typed inputs. No iteration order dependency on Set iteration would matter because the only Set used (`failureClasses`) is sorted before output (`:455`). Trial iteration uses `input.trials` order; `trialRefs` output reflects input order.
7. **No exceptions for valid input shapes** beyond fail-closed validation.

The one minor weakness is symmetric with the prior T-082/T-100 review: derivation `throw`s on bad input rather than returning a `Result`. Consistent with the surrounding M03 admission style; acceptable.

## 8. Surface duplication audit

`eval_suite.ts` does **not** duplicate T-082 or T-100. It composes them via reference:

- It imports `RuntimeFailureClass` and `RuntimeRegime` from `./carriers.js` (`eval_suite.ts:6`). No re-derivation.
- It does **not** import or re-implement `OutputInstanceAllocation`, `WorkspaceAssetBinding`, `ZoomFoldbackEvaluation`, `ScheduledSliceAssessment`, `ObligationLedgerAsset`, or `ObligationScheduleAsset`. Instead the carrier exposes `EvalOutcome.materializedOutputRefs` and `admittedEvidenceRefs` and `foldbackRef` as `string` ref fields. The eval projection sits **above** the T-082/T-100 truth, naming refs into it; it does not re-derive ledger or foldback semantics.
- The sandbox `test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs` is the integration point that **populates** the eval refs from real T-082 allocation + T-100 foldback + ledger + assessment data: e.g., `outputRootRef: file://${runtimeRoot}` (`:953`), `eventStreamRef: file://${runtimeRoot}/events.jsonl` (`:954`), `foldbackRef: foldback.foldbackRef` (`:975`), `admittedEvidenceRefs: [ledger.ledgerRef, schedule.scheduleRef, foldback.foldbackRef, ...assessments.map(a=>a.assessmentId)]` (`:976-981`).
- The T-082 allocation and T-100 ledger/schedule/foldback derivations are unchanged and continue to be the source of truth. The eval layer adds suite/task/trial identity and aggregates pass@k/pass^k over those.

This is the correct shape: a thin projection layer above existing event/ledger truth, not a parallel runtime authority. T-102's non-closure condition "eval aggregate state becomes a second controller authority rather than a projection artifact" is honored.

## 9. Ticket hygiene

**T-101.**
- `change_class: design_reframe`, `re_entry_point: design`. Appropriate.
- `closure_law` requires F_D not replacing F_P, per-edge ledger inspectability, manual rerun, no overwrite of admitted evidence on live failure. Sharp.
- `non_closure_conditions` four bullets, all enforceable.
- `acceptance_criteria` lists `npm run test:t101:edge1/2/3/full/gaps`. These are not in `package.json` — only `test:t101` exists. Per-edge invocations are operator-driven via `node run.mjs --edge ...`. **Drift between AC text and reality** (Low, see §3). Either add npm scripts or revise AC.
- `dependencies` cites T-082 and T-100. Should also reference T-102 since T-102 was authored alongside (operator's note). One-way link.

**T-102.**
- Frontmatter is rich: `governance_scope_expansion` covers S/T/D/O methods; `external_source` cites Anthropic article; `related_comments` cites design summary plus codex synthesis; `related_design` cites M03 derivation doc. Strong.
- `closure_law` requires pure M03 projection module + sandbox emissions + repeat support + capability/regression marking + focused tests. All achieved per implementation checkpoint.
- `non_closure_conditions` five bullets, all enforceable; the F_D-rows-judging-semantic-content guardrail is explicit.
- `dependencies` correctly cites T-082, T-100, T-101.
- "Implementation Checkpoint: 2026-05-02" embedded in the ticket. Rich, but properly under a section header — not pretending to be ratified spec.
- `change_class: design_reframe`, `re_entry_point: design`. Appropriate; the ABG runtime law is unchanged; the projection is additive.

**Pair pattern (T-082/T-100 echoed by T-101/T-102).**
- Both active simultaneously. T-102 is the lower carrier primitive (pure projection module); T-101 is the higher consumer (operator-runnable sandbox). Same shape as the prior pair.
- Non-absorption: T-102 does not encode mini-data-mapper-specific concerns (the carrier is generic); T-101 does not encode projection law (the sandbox calls into `eval_suite.ts` constructors). Lane separation is clean.
- Sequencing: parallel work is sequenced through `test:t102` invoking both the unit tests AND `T100_MINI_SANDBOX_REPEAT=2 ... sandbox`. The ratification gate composes both layers. Adequate.

## 10. Eval artifact shape

The 8 emitted artifacts are present per the operator's claim (`test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs:1116-1189`):

1. `eval_suite.json` — suite spec, `:1116`.
2. `eval_task.json` — task definition, `:1117`.
3. `eval_trials.jsonl` — one JSON record per trial, `:1143`.
4. `eval_outcomes.jsonl` — one record per trial, `:1144`.
5. `eval_grade_vectors.jsonl` — per-grader scores, `:1145-1148`.
6. `eval_aggregate_projection.json` — pass@k/pass^k/distributions, `:1149-1152`.
7. `summary.json` — top-level run summary, `:1153-1163`.
8. `review_sample.md` — transcript review hook, `:1164-1189`.

Per-trial artifacts also written: `eval_trial.json`, `eval_outcome.json`, `eval_grade_vector.json`, `summary.json`, `postmortem.md`, `stdout.log`, `stderr.log` — under each `trials/trial-NNN/` directory. The full evidence is independently inspectable per trial.

**Capability/regression annotation.** `EvalSuiteSpec.suiteClass = "capability"` for the mini data mapper run (`:1103`); `eval_aggregate_projection.json` echoes `suiteClass: "capability"`. The taxonomy is carrier-resident, not just narrative. Good. `test_env/test_surface_map.md:117-135` adds the eval-taxonomy section the design summary G1 asked for, with the four lanes (`test:semantic`, `test:t082`, `test:t100:unit`, `test:t102`) marked regression and the four (`test:t100:sandbox`, `test:t100:five-rule`, `test:t100:test35-parity`, `test:t101`) marked capability. The pass@k/pass^k convention and the F_D-mechanical-only rule are documented in the same section.

**Transcript-review affordance.** `review_sample.md` for the k=3 run lists all transcript refs and tags failed trials. The current implementation is full-population, not sampled — fine at k=3, will need sampling at higher k (see §3 finding row 7). The body says "Semantic grade vectors are F_P rows. The F_D row only checks the mechanical envelope." — the boundary rule is restated where an SME doing transcript review will see it. Good.

**Saturation surfacing.** Not in `eval_aggregate_projection.json`. The `saturationPolicy` field is on `EvalSuiteSpec` (free-form string) and is propagated to `eval_suite.json`, but no derived `saturationStatus` is computed by the aggregate. See §3 finding row 3.

## 11. Compliance with the recently-built T-101 mini sandbox

The mini-dm-redux structure built fresh hours before this work is preserved by both T-101 (which the sandbox itself is) and T-102's eval-suite emissions:

- `mini_dm_redux/run.mjs:311-592` (the per-edge `runEdge` function) is unchanged in shape: edge gating by prior-edge state (`:314-321`), seed inputs (`:323`), basis derivation (`:335`), allocation (`:351-361`), ledger + schedule + zoom frame (`:365-381`), F_P worker invocation (`:417-422`), F_D envelope check (`:438-444`), F_P semantic evaluation per obligation (`:447-457`), assessment admission with `findingClass` (`:482-510`), foldback (`:513-521`), event emission (`:524-526`), per-edge zoom directory writes (`:528-543`).
- The F_P/F_D split is preserved per §4.
- Per-edge runnable shape is preserved: `runEdge` is callable in isolation and stores per-edge state in `state.json`.
- Evidence-trail layout under `runtime/zoom_foldback/<edge>/` (`:528-543`) is preserved with `ledger.json`, `schedule.json`, `frame.json`, `foldback.json`, `outer.json`, `manifest.json`, `fd_envelope.json`, `fp_evaluation.json`, `assessments.jsonl`. Operator can `cat` between runs.
- T-102's new sandbox additions (`test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs`) are **layered on top** of a different sandbox (the T-100 mini data mapper lifecycle sandbox), not the T-101 mini-dm-redux one. The T-101 sandbox surface is not modified by the eval-suite work. No inadvertent undoing.

## 12. Closure recommendation

**T-102: ratify.** All `closure_law` clauses satisfied:
- Pure M03 eval projection module: `code/src/abg/m03/contracts/eval_suite.ts` exists, pure, frozen, closed sums, fail-closed. ✓
- T-100 mini data-mapper emits suite/task/trials/outcomes/grade_vectors/aggregate_projection/summary/review_sample artifacts. ✓
- Repeat execution records pass@k/pass^k. ✓ (Boolean shape; numeric `passRate` also present.)
- `test_surface_map` distinguishes capability and regression suites. ✓
- Focused tests pass: `test:t102` 6/6 unit + 1/1 sandbox; `T100_MINI_SANDBOX_REPEAT=3` 1/1. ✓
- All non-closure conditions avoided: no second authority, no F_D semantic rows, isolated trial roots, pass@k/pass^k present in evidence, F_P/F_D boundary named in the ticket and in `review_sample.md` text. ✓

Follow-ups (non-blocking) in §13.

**T-101: ratify.** All `closure_law` clauses satisfied:
- Mini sandbox has a durable ticket, operator-facing commands, per-edge and full-run modes, fixture and live worker paths, runtime artifacts under test_runs, and proof that F_D does not replace F_P semantic evaluation. ✓
- Non-closure conditions avoided: F_D scope is mechanical only (verified §4); manual rerun supported (`run.mjs --edge` / `--full`); per-edge ledger/foldback artifacts inspectable; live failure does not overwrite admitted semantic evidence (assessment is not admitted unless evaluation is fulfilled, per `:482-510`). ✓

Tighten: AC text should match `package.json` reality (see §3 row 9), or add `test:t101:edge1/2/3/full/gaps` npm scripts. This is a documentation drift, not a closure blocker.

## 13. Non-blocking advisory

- **Promote pass@k/pass^k to numeric** (or add `passAtKRate`). Boolean is fine for current saturated capability-but-easy suites; for hard capability suites the numeric shape is what an operator needs.
- **Per-task aggregation** when the first multi-task suite lands. Add a `perTask` projection field then.
- **Saturation indicator** as a derived field on `EvalAggregateProjection` rather than free-form `saturationPolicy` text. Compute from `suiteClass` + `passRate` + trial count.
- **Closed-sum `EvalGradeRow`** split into `FdMechanicalRow | FpSemanticRow | FhAdjudicationRow` variants, with per-variant invariants (e.g., F_D requires `obligationRef === null`, F_P requires `obligationRef !== null`). Type-system enforcement of the constitutional rule rather than convention. Material if the F_P/F_D bug class recurs.
- **Sample-driven `review_sample.md`** at higher k. Fail-biased sampler, not full-population listing.
- **Bidirectional T-101 ↔ T-102 cross-reference** in ticket frontmatter. Add `T-102` to T-101's `dependencies` (or add a `related_tickets:` block).
- **Map sandbox trial failureClass to actual runtime cause** when the failure path becomes reachable.
- **Document F_D fail-out at vector verdict** with a comment near `eval_suite.ts:321` (compositional gating, not regime substitution).
- **Saturation flag the current sandbox.** With pass^k=1 at k=3, the mini-data-mapper sandbox is already at saturation territory for the bootstrap-to-design lifecycle. Either harden the F_P assessor (raise the bar to behavioral/AST checks beyond marker substring), or accept that this suite has converted from capability to regression and re-tag `suiteClass: "regression"`. Today it claims `capability` but behaves as regression.
