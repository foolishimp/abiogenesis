---
id: T-102
title: Formalize ABG eval-suite projection artifacts and repeatable sandbox runs
type: feature
ticket_category: eval_projection
status: completed
review_status: closure_accepted_for_eval_projection_layer
goal: repeatable-abg-building-block-for-workspace-visible-asset-traversal-assurance
change_intent: Turn the Anthropic eval guidance into an ABIogenesis-owned eval projection layer over existing ABG event/admission truth, with repeatable sandbox trials and pass@k/pass^k reporting.
change_class: design_reframe
re_entry_point: design
affected_boundary: M03 eval projection carriers, TypeScript sandbox test_runs artifacts, capability/regression test taxonomy, F_D/F_P/F_H grader boundary
priority: high
triaged_at: 2026-05-02T17:25:59+10:00
created_at: 2026-05-02T17:25:59+10:00
updated_at: 2026-05-02T17:25:59+10:00
closed_at: 2026-05-02T21:40:26+10:00
dependencies:
  - T-082 active ABG output instance allocation
  - T-100 active workspace zoom foldback building block
  - T-101 active mini data-mapper redux sandbox
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
related_comments:
  - .ai-workspace/comments/claude/20260502T053000Z_DESIGN_eval-framework-from-anthropic-demystifying-evals.md
  - .ai-workspace/comments/codex/20260502T170909AEST_anthropic_eval_design_summary_for_abg.md
external_source:
  - https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
intake_source: Operator approved implementation of the eval design summary derived from Anthropic's agent-eval article and the local Claude synthesis, with the explicit constraint that F_D must not replace F_P semantic checks.
target_truth: ABIogenesis exposes eval suites as typed, replay-derived projection artifacts over ABG runs: suite, task, trial, outcome, grade vector, and aggregate projection. Repeated sandbox trials write inspectable artifacts under test_runs and report pass@k/pass^k without letting F_D own semantic quality.
superseded_truth: Test lanes are only green/red command outputs with no durable eval task identity, no repeated-trial reliability projection, and no explicit separation between mechanical envelope checks and semantic product evaluation.
closure_law: close only when a pure M03 eval projection module exists, T-100 mini data-mapper emits eval_suite/eval_task/eval_trials/eval_outcomes/eval_grade_vectors/eval_aggregate_projection artifacts, repeat execution records pass@k/pass^k, test_surface_map distinguishes capability and regression suites, and focused tests pass.
non_closure_conditions:
  - eval aggregate state becomes a second controller authority rather than a projection artifact
  - F_D rows judge semantic content
  - repeated trials share mutable output roots
  - pass@k/pass^k are absent from durable test_runs evidence
  - ticket/proof surfaces do not name the F_P/F_D boundary
---

# T-102: ABG Eval-Suite Projection Artifacts

## STDO Triage

First missing layer: design.

The requirement surface already gives ABG runtime truth, event sourcing,
provenance, qualification, and evaluator regimes. The missing layer is a
carrier-shaped eval projection for the test/proof plane.

This ticket does not change GTL or ABG runtime closure law. It adds a typed
projection over admitted run evidence so capability and regression evals are
durable, repeatable, and reviewable.

## Boundary Rule

Adopt Anthropic's eval vocabulary, but keep ABIogenesis stricter:

- ABG owns suite/task/trial/outcome projection mechanics.
- GTL owns graph-function task boundaries.
- Products own semantic meaning.
- F_D validates only objective mechanical envelope predicates.
- F_P owns `A.req_i -> B.result_i` semantic quality judgment.
- F_H calibrates or resolves disputed semantic judgment.

If deterministic code judges semantic content, it is still F_P-domain
assessment, not F_D.

## Target Carrier Family

```text
EvalSuiteSpec
  -> EvalTask[]
  -> EvalTrial[]
  -> EvalOutcome[]
  -> EvalGradeVector[]
  -> EvalAggregateProjection
```

`EvalAggregateProjection` reports:

- `passAtK`: at least one trial passed.
- `passAllK`: every trial passed.
- pass rate and verdict.
- grade row counts by pass/fail/unknown.
- runtime failure classes when present.

## Acceptance Criteria

- `code/src/abg/m03/contracts/eval_suite.ts` exposes pure constructors and
  aggregate projection.
- `test_env/tests/test_t102_eval_suite_projection_unit.test.mjs` proves
  pass@k/pass^k, missing-outcome unknown state, and no semantic authority from
  F_D.
- `test_env/sandbox/test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs`
  emits:
  - `eval_suite.json`
  - `eval_task.json`
  - `eval_trials.jsonl`
  - `eval_outcomes.jsonl`
  - `eval_grade_vectors.jsonl`
  - `eval_aggregate_projection.json`
  - `review_sample.md`
- The T-100 sandbox accepts `T100_MINI_SANDBOX_REPEAT=<N>` and allocates a fresh
  trial workspace for each repeat.
- `test_env/test_surface_map.md` marks regression and capability/parity evals.
- `npm run test:t102` runs the focused unit lane plus repeated T-100 sandbox.

## Non-Goals

- Do not introduce a second runtime event log.
- Do not embed downstream domain semantic rubrics in ABG core.
- Do not add an LLM-as-judge framework before a calibrated downstream judge is
  needed.
- Do not treat transcript/tool-call ordering as closure truth.

## Implementation Checkpoint: 2026-05-02

Implemented surfaces:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/eval_suite.ts`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t102_eval_suite_projection_unit.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/sandbox/test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`

Implemented runtime/proof shape:

- pure constructors for `EvalSuiteSpec`, `EvalTask`, `EvalTrial`,
  `EvalOutcome`, and `EvalGradeVector`
- pure `deriveEvalAggregateProjection(...)`
- pass@k as `passAtK`
- pass^k as `passAllK`
- missing outcomes counted as unknown, not pass
- trial pass now requires both passed outcome truth and a matching passing
  grade vector
- duplicate outcome truth, duplicate grade-vector truth, missing suite task
  truth, and grade-row/vector lineage mismatches fail closed
- T-100 mini data-mapper sandbox writes isolated trial roots under
  `test_runs/t100_mini_data_mapper_lifecycle/<suite-run>/trials/<trial>`
- T-100 sandbox emits suite-level eval artifacts:
  `eval_suite.json`, `eval_task.json`, `eval_trials.jsonl`,
  `eval_outcomes.jsonl`, `eval_grade_vectors.jsonl`,
  `eval_aggregate_projection.json`, `summary.json`, and `review_sample.md`
- F_D grade row covers only mechanical envelope/materialization projection
- F_P grade rows cover requirement-by-requirement semantic assessment

Observed verification:

```text
npm run build:semantic
node --test test_env/tests/test_t102_eval_suite_projection_unit.test.mjs
T100_MINI_SANDBOX_REPEAT=2 node --test test_env/sandbox/test_t100_mini_data_mapper_lifecycle_sandbox.test.mjs
npm run test:t102
npm run lint:semantic
npm run lint:test-harness
npm run test:t100
npm run test:semantic
```

Result:

- `npm run test:t102` passed, 7/7 across the T-102 unit lane and repeated T-100
  sandbox.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:t100` passed, 9/9.
- `npm run test:semantic` passed, 324/324.

Self-review correction:

- Initial implementation allowed `outcome.passed` to count as a passing trial
  even if the grade vector had an F_P failure row, and it did not fail closed on
  duplicate or mismatched outcome/grade-vector lineage.
- The projection now derives passing trial count from matching outcome plus
  matching grade-vector verdict and rejects duplicate/mismatched evidence.

## Closure Disposition: 2026-05-02

T-102 is closed for the ABIogenesis TypeScript source scope.

Closure evidence:

- `eval_suite.ts` is a pure M03 projection module over suite, task, trial,
  outcome, grade-vector, and aggregate truth.
- Repeated sandbox trials allocate isolated roots and publish
  `eval_suite.json`, `eval_task.json`, `eval_trials.jsonl`,
  `eval_outcomes.jsonl`, `eval_grade_vectors.jsonl`,
  `eval_aggregate_projection.json`, `summary.json`, and `review_sample.md`.
- F_D rows are mechanical envelope gates only. F_P rows own per-obligation
  semantic judgment; the aggregate requires matching outcome truth plus grade-
  vector pass.
- `test_surface_map.md` distinguishes regression and capability/parity eval
  lanes.

Verification rerun:

- `npm run test:t102` passed, 7/7.
- `npm run test:t100:test35-parity` passed, 15/15.
- `npm run test:semantic` passed, 349/349.
- `npm run lint:semantic` passed.
