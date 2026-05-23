# T-145 Realize Evaluate.C As Evaluation-Set Phase Over Read-Only Ledgers

- id: T-145
- title: Realize evaluate.C as an evaluation-set phase over read-only ledgers
- type: requirement_alignment
- ticket_category: specification_compliance
- status: completed
- proof_status: passed
- build_tenant: typescript
- created_at: 2026-05-23
- updated_at: 2026-05-23
- priority: high
- change_class: requirement_reprice
- re_entry_point: runtime_governance
- first_missing_layer: evaluation phase law over selected composition and ledger/register fan-out
- parent_context:
  - T-144
  - T-143
  - T-134
  - T-095
  - T-131
  - T-139
- affected_boundary:
  specification:
    - specification/PRODUCT.md
    - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
    - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  design:
    - build_tenants/abiogenesis/typescript/design/modules/
    - build_tenants/abiogenesis/typescript/design/M03_ABG_PROBABILISTIC_MONAD_PLUGIN_BOUNDARY_DERIVATION.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/evaluation_set.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/payload_ledger.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/assurance.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fn_composition.ts
  tests:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t144_abg_probabilistic_monad_plugin_boundary.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t145_evaluation_set_phase.test.mjs

## Problem

T-144 correctly established `C` as selected composition notation and realized a
runner-consumed `evaluate.C/F_P` steel thread. That is necessary but still too
scalar.

The evaluation phase is not one evaluator call. `evaluate.C` is a phase
boundary that may contain a collection of evaluation rules. Those rules may be
deterministic, probabilistic, or human-callout by selected composition. Many of
the deterministic rules build registers and ledgers specifically to prevent
shallow evaluation and premature closure.

Some products need only a small evaluation set. Data-heavy products may require
hundreds of deterministic evaluators over data, schema, lineage, coverage,
target-carrier state, observed workspace facts, and domain registers. These
rules are read-only over the workspace and admitted runtime state, so ABG should
be able to schedule them as a loop or parallel loop while preserving stable
admission and replay order.

The closure input must be:

```text
admitted transform truth
+ admitted evaluation register/ledger set
+ admitted F_P semantic judgment when selected composition requires it
```

It must not be:

```text
one evaluator response
```

## Target Truth

`evaluate.C` is an evaluation-set phase over selected `abg.fn_composition`.

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(plugin.transform.C)
  .bind(system.admitTransform)
  .bind(system.writeTransformEventsAndLedgers)
  .bind(system.planEvaluationSet)
  .bind(plugin.evaluate.C.rule[*])
  .bind(system.admitEvaluationRuleResult[*])
  .bind(system.writeEvaluationLedgers)
  .bind(system.collectEvaluationSet)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

The phase may reduce to one rule, but the model is a rule set:

```text
evaluate.C =
  compose(
    evaluate.C.F_D.register_rule[*],
    evaluate.C.F_P.semantic_judgment_rule[*],
    evaluate.C.F_H.external_callout?
  )
```

`evaluate.C.F_D.register_rule[*]` is retained. These deterministic evaluators
build registers, evidence rows, coverage rows, shape checks, lineage checks,
target-carrier checks, and other admitted evaluation facts. They are an
optimization and structuring pass, not final semantic closure authority unless
the selected composition and closure contract lawfully reduce the phase to
deterministic proof.

`evaluate.C.F_P.semantic_judgment_rule[*]` evaluates over admitted transform
truth plus the admitted evaluation register set. It supplies semantic judgment,
gain, residual pressure, continuation refs, close disposition proposals, and
diagnostics where ambiguity remains.

`evaluate.C.F_H.external_callout` remains external to ABG. ABG may emit or
admit the callout boundary and response carrier; human work itself is outside
ABG.

## Boundary Rules

- Evaluation rules may read workspace state, runtime projections, payload
  ledgers, observed-state ledgers, construction pressure packages, target
  carrier projections, assurance contexts, and product-owned read-only
  projections.
- Evaluation rules may not write runtime events, ledgers, traversal state,
  closure state, continuation state, replay truth, or product read-model truth.
- ABG owns evaluation-set planning, scheduling, admission, stable ordering,
  ledger writes, assurance fold, traversal transition, and replay truth.
- Product plugins own rule behavior inside declared boundaries and product
  interpretation of domain-specific registers.
- Parallel evaluation is lawful only when each rule is read-only over admitted
  state and writes only by returning a result for ABG admission.
- The replay identity of an evaluation set must not depend on wall-clock
  completion order.
- Closure must fail closed when required evaluation rules are absent,
  malformed, stale, contradictory, or not admitted.

## Design Direction

Introduce an evaluation-set carrier family rather than widening the scalar
`fp_evaluator` path:

- `EvaluationRuleDeclaration`
  - selected composition ref/digest
  - selected regime binding ref
  - stage role `evaluate`
  - compute means `F_D`, `F_P`, or `F_H`
  - rule ref
  - input ledger/projection refs
  - output carrier refs
  - required/optional classification
  - parallelization group or dependency refs
- `EvaluationSetPlan`
  - vector scope
  - selected composition identity
  - ordered and/or parallel rule batches
  - required rule refs
  - read-only input refs
  - replay-stable plan digest
- `EvaluationRuleOutcome`
  - rule ref
  - compute means
  - produced register/evidence/finding refs
  - residual pressure refs
  - continuation refs
  - diagnostics
  - selected composition identity
  - no engine authority flags
- `EvaluationSetAdmission`
  - admitted rule outcomes
  - rejected rule outcomes
  - missing required rules
  - stale/contradictory rule rows
  - replay-stable evaluation-set ref
- `EvaluationSetProjection`
  - admitted register set
  - admitted semantic finding set
  - admitted human response set when present
  - fold input refs

The existing `FpEvaluationOutcome` steel thread may become one rule outcome in
the evaluation set. It must not remain the only generic shape of
`evaluate.C`.

## Implementation Plan

1. Requirement reprice
   - Update compute-notation and fn-composition requirements to state that
     `evaluate.C` is a phase over an evaluation rule set.
   - Clarify that deterministic register builders are first-class evaluation
     rules and are retained.
   - Clarify that F_P evaluation judges over admitted transform truth plus the
     admitted evaluation register set.

2. Design module update
   - Add a design section or module derivation for evaluation-set planning,
     rule scheduling, admission, projection, and assurance fold input.
   - Show the loop and parallel-loop forms.
   - Show how scalar T-144 `fp_evaluator` is a reduction of the rule-set model.

3. Contract carriers
   - Add typed evaluation-rule declarations, plans, outcomes, admissions, and
     projections.
   - Preserve selected composition ref/digest and selected regime binding refs.
   - Make engine authority denial explicit on rule outcomes.
   - Require replay-stable rule-set identity and stable batch ordering.

4. Runner realization
   - Replace the scalar evaluation path with evaluation-set planning.
   - Execute deterministic register rules as a loop or parallel loop when the
     plan allows it.
   - Execute F_P semantic judgment after required register facts are admitted,
     unless selected composition declares an equivalent deterministic reduction.
   - Preserve the current scalar `fp_evaluator` behavior as a one-rule
     reduction, not as a parallel authority path.

5. Admission and ledgers
   - ABG admits each evaluation rule result.
   - ABG writes evaluation ledger facts in stable replay order.
   - ABG collects admitted results into one evaluation-set projection.
   - Assurance fold consumes the evaluation-set projection, not a raw plugin
     return.

6. Parallelism
   - Add batch execution for independent read-only evaluation rules.
   - Ensure admitted result order is deterministic even when execution order is
     parallel.
   - Fail closed on overlapping write intent, hidden mutable side effects, or
     rule outputs that claim engine authority.

7. Downstream alignment
   - Update downstream guidance so ODD SDLC can retain current deterministic
     register/evaluator processes while adding final F_P semantic evaluation
     over transform plus registers.
   - T-180 must consume this model before SDLC migration closure.

## Acceptance Criteria

- [x] Product and requirements state that `evaluate.C` is an evaluation-set
  phase, not a scalar evaluator call.
- [x] `evaluate.C.F_D.register_rule[*]` is represented and preserved as
  first-class deterministic evaluation work.
- [x] `evaluate.C.F_P.semantic_judgment_rule[*]` evaluates over admitted
  transform truth plus admitted evaluation registers.
- [x] ABG owns all writes: rule outputs are proposed values until admitted by
  ABG.
- [x] Evaluation rules carry selected composition ref/digest and selected
  regime binding ref.
- [x] Evaluation-set planning can express ordered and parallel batches.
- [x] Parallel evaluation is replay-stable and independent of wall-clock
  completion order.
- [x] Closure fold consumes an admitted evaluation-set projection.
- [x] Missing, stale, contradictory, malformed, or unadmitted required rule
  results block or reprice rather than closing.
- [x] Tests prove a scalar one-rule evaluation remains a lawful reduction.
- [x] Tests prove many F_D register rules can run and be admitted before F_P
  semantic judgment.
- [x] Tests prove hundreds of read-only F_D evaluators can be planned without
  collapsing into product-local runtime code.
- [x] Tests prove a malicious evaluation rule cannot write ledgers, emit
  runtime events, select traversal, continue, replay, or close.

## Review-Carried Guardrails

These guards came from the T-144 post-review hardening and must remain true
when the scalar `fp_evaluator` path is generalized into the evaluation-set
phase:

- [x] Every evaluation rule outcome is validated against the selected
  `abg.fn_composition` ref/digest and selected regime-binding contribution ref
  before ABG writes evaluation events.
- [x] Runner-consumed `evaluate.C/F_P` uses `FpEvaluationOutcome` or the
  evaluation-set successor carrier as the single public carrier truth.
  Edge-assurance hook findings remain subordinate hook findings, not a second
  runner-consumed carrier.
- [x] Rule close dispositions affect admitted evidence and authority rows.
  `no_close`, `human_required`, retry, reprice, block, and qualified defer
  cannot be hidden inside an otherwise fulfilled outcome.
- [x] Missing required product evaluator/rule plugins fail closed. Any
  synthetic fallback evaluator used by tests or fixtures must be explicitly
  installed by that proof lane.
- [x] T-084/T-087/T-098/T-099/T-106/T-128/T-135/T-139 legacy lanes keep using
  explicit synthetic evaluators only when they are proving transform/retry or
  construction mechanics rather than product evaluation availability.

## Proof Plan

- [x] Add `npm run test:t145`.
- [x] Run `npm run build:semantic`.
- [x] Run `npm run test:t144`.
- [x] Run `npm run test:t145`.
- [x] Run `npm run test:semantic`.
- [x] Run `npm run lint:semantic`.
- [x] Run `git diff --check`.

## Closure Law

This ticket closes only when `evaluate.C` is represented and tested as an
evaluation-set phase. A single `fp_evaluator` runner hook is not sufficient for
closure unless it is explicitly proven as a one-rule reduction of the
evaluation-set model.

## Closure Evidence

Implemented:

- `EvaluationRuleDeclaration`, `EvaluationSetPlan`, `EvaluationRuleOutcome`,
  `EvaluationSetAdmission`, and `EvaluationSetProjection`.
- Runner-consumed `evaluationRules` with ordered and parallel batch planning.
- Async evaluation-rule batch invocation through `runEngineIterateAsync`, with
  stable ABG admission order independent of completion order.
- Scalar `FpEvaluationOutcome` wrapped as the one-rule F_P semantic judgment
  reduction.
- Required-rule fail-closed behavior, selected composition validation, and
  authority-field rejection for rule outcomes.
- Carrier-level plan/admission validation rejects undeclared, duplicate, and
  selected-composition-mismatched evaluation rule outcomes before they can be
  collected into an evaluation-set projection.
- The F_D advance branch now enters the evaluation-set phase before scalar
  F_D authority. Required register gaps block before `fdEvaluator` is invoked,
  and admitted F_D scalar outcomes are written as evaluation-rule payload
  ledger facts before the legacy `fd_authority_outcome_admitted` read model.
- The F_P dispatch branch now gates the scalar F_P semantic evaluator behind
  admitted required register outcomes. Missing or rejected required register
  rules stop the traversal before `fp_evaluator` is invoked.
- Evaluation-set plans fail closed when dependency refs are unknown,
  self-referential, or scheduled in the same/later batch. Parallel batches are
  only legal for independent read-only rules.
- `assuranceDecisionForCurrentVector` now receives the admitted
  `EvaluationSetProjection`, and the closure input surface carries the
  evaluation-set projection ref as fold input truth.

Verified before closure:

- `npm run build:semantic`
- `npm run test:t144`
- `npm run test:t145` (10 tests)
- `npm run test:semantic` (626 tests)
- `npm run lint:semantic`
- `git diff --check`

The broader symmetry that every composed `.C` stage should use the same
stage-set law is not hidden in this ticket. It is captured as T-146 and remains
active for transform/consequence convergence.

## Scalar Evaluate Re-Entry Evidence

Post-closure review found that scalar `evaluate.C` was asymmetric with the
stage-set dataflow law. Register rules were admitted before scalar F_D/F_P
evaluation, but the final scalar evaluator inputs did not receive same-stage
register fold refs in `stageSetDependencyRefs` and
`EngineComputeStageBinding.predecessorRefs`.

The runner now constructs scalar F_D evaluator input after pre-scalar register
admission, and scalar F_P evaluator input after pre-semantic register
admission. Both scalar reductions consume the current
`EvaluationSetProjection` fold input as same-stage dependency truth.

Regression proof added:

- T-145: scalar F_D evaluator inputs carry admitted register refs through
  `stageSetDependencyRefs` and `computeStageBinding.predecessorRefs`.
- T-145: scalar F_P evaluator inputs carry admitted register refs through
  `stageSetDependencyRefs` and `computeStageBinding.predecessorRefs`.
- T-145: scalar F_D replay input identity changes when admitted register refs
  change.
- T-145: scalar F_P replay input identity changes when admitted register refs
  change.

Verified after the scalar evaluate fix:

- `npm run build:semantic` passed.
- `npm run test:t144` passed, 14 tests.
- `npm run test:t145` passed, 14 tests.
- `npm run test:t146` passed, 14 tests.
- `npm run test:semantic` passed, 644 tests.
- `npm run lint:semantic` passed.
- `git diff --check` passed.
