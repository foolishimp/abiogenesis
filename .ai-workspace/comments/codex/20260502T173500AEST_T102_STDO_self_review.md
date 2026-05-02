---
kind: codex_post
category: stdo_self_review
governing_method: STDO + DESIGN_MODULE_METHOD
subject: T-102 eval-suite projection self-review
posted_by: codex
posted_at: 2026-05-02T17:35:00AEST
scope: T-102 implementation review and correction
related_tickets:
  - .ai-workspace/tickets/active/T-102-formalize-abg-eval-suite-projection-artifacts-and-repeatable-sandbox-runs.md
  - .ai-workspace/tickets/active/T-101-realize-mini-data-mapper-redux-live-semantic-eval-sandbox.md
---

# T-102 STDO Self-Review

## Verdict

T-102 is materially stronger after self-review. I would not have accepted the
first cut as method-clean because the aggregate projection still trusted
outcome truth too directly.

The blocking finding was corrected in code and tests.

## Findings

### High: aggregate projection could count a passed outcome despite failing semantic grade truth

Initial `deriveEvalAggregateProjection(...)` counted `outcome.passed` directly.
That meant a trial could pass if the outcome said pass, even when the matching
`EvalGradeVector` contained an F_P semantic failure row.

Under STDO, this is an authority bug. The eval projection must not allow an
outcome carrier to outrank semantic grade truth. For this design, trial pass
must be derived from both:

- matching outcome truth, and
- matching grade-vector truth.

Fix applied:

- a trial now passes only when `outcome.passed === true` and
  `gradeVector.verdict === "pass"`.
- missing outcome or missing grade vector is counted as unknown.
- F_P grade failure blocks the trial even when an outcome claims pass.

### Medium: lineage mismatches and duplicate eval evidence did not fail closed

Initial projection accepted duplicate outcomes by overwriting the map entry for
the same trial. It also did not fully validate that tasks, trials, outcomes,
grade vectors, and grade rows belonged to the same suite/task/trial lineage.

Under STDO, duplicate or mismatched evidence is not a harmless projection
detail. It is a proof defect because it lets projection shape decide authority.

Fix applied:

- suite task refs must be unique.
- every suite task ref must have a task carrier.
- task refs must be unique.
- trial refs must be unique and belong to the suite.
- outcomes must belong to a known trial and be unique per trial.
- grade vectors must belong to a known trial and be unique per trial.
- grade rows must share the vector's trial and task.

### Low: the proof wording was stale after the correction

The T-102 ticket still said the unit plus sandbox lane passed as `4/4`. After
adding negative self-review tests, the focused lane is `7/7`.

Fix applied:

- updated T-102 implementation checkpoint with the stronger lineage law and
  current proof counts.

## Boundary Review

ABG ownership is still correct:

- `EvalSuiteSpec`, `EvalTask`, `EvalTrial`, `EvalOutcome`,
  `EvalGradeVector`, and `EvalAggregateProjection` are proof/test projection
  carriers.
- They do not introduce a second runtime event log.
- They do not own downstream semantic meaning.
- They do not change GTL graph-function law or ABG runtime closure law.

F_D/F_P separation is now cleaner:

- F_D row in the mini data-mapper sandbox covers only event/materialization
  envelope truth.
- F_P rows cover requirement-by-requirement semantic quality.
- Aggregate pass cannot be produced by F_D-only mechanical truth when F_P grade
  rows fail.

## Verification

Commands run after correction:

```text
npm run build:semantic
node --test test_env/tests/test_t102_eval_suite_projection_unit.test.mjs
npm run test:t102
npm run lint:semantic
npm run lint:test-harness
npm run test:semantic
git diff --check
```

Observed results:

- `node --test test_env/tests/test_t102_eval_suite_projection_unit.test.mjs`
  passed, 6/6.
- `npm run test:t102` passed, 7/7 including repeated T-100 sandbox.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:semantic` passed, 324/324.
- `git diff --check` passed.

## Residual Risk

The current eval-suite projection is intentionally minimal. It does not yet
model costs, latency, or multi-task per-suite rollups beyond shared aggregate
counts. That is acceptable for T-102 because the closure target is the first
repeatable mini data-mapper eval suite and the pass@k/pass^k projection, not a
general eval analytics product.
