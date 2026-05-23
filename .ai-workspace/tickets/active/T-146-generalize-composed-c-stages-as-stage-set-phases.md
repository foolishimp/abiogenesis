# T-146 Generalize Composed .C Stages As Stage-Set Phases

- id: T-146
- title: Generalize composed `.C` stages as stage-set phases
- type: design_reframe
- ticket_category: specification_compliance
- status: active
- proof_status: not_started
- build_tenant: typescript
- created_at: 2026-05-23
- updated_at: 2026-05-23
- priority: high
- change_class: requirement_reprice
- re_entry_point: runtime_governance
- first_missing_layer: shared stage-set law for every composed `.C` stage
- parent_context:
  - T-144
  - T-145
  - T-143
  - T-141
  - T-139
- affected_boundary:
  specification:
    - specification/PRODUCT.md
    - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
    - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_ABG_PROBABILISTIC_MONAD_PLUGIN_BOUNDARY_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_COMPOSED_C_STAGE_SET_DERIVATION.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/evaluation_set.ts
    - new composed-stage-set carrier family
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  tests:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t145_evaluation_set_phase.test.mjs
    - new T-146 transform/consequence stage-set tests

## Problem

T-145 realized `evaluate.C` as an evaluation-set phase. That should not remain
an evaluation-only special case.

The underlying rule is broader: any composed `.C` stage is a planned set of
stage tasks under selected `abg.fn_composition`. A scalar plugin call is only a
one-task reduction of the same model.

This applies to:

- `transform.C.F_D[]`
- `transform.C.F_P[]`
- `evaluate.C.F_D[]`
- `evaluate.C.F_P[]`
- `consequence.C.F_D[]`
- `consequence.C.F_P[]` when a downstream product lawfully requires
  probabilistic consequence projection
- `F_H` as an external callout boundary, never as internal human work

The current TypeScript runner has the evaluation-set specialization, but
`transform.C` still enters through a scalar `fpDispatch` edge and
`consequence.C` still enters through a scalar projection plugin. That creates a
symmetry break in the epistemology and invites downstream products to rebuild
local orchestration loops.

## Target Truth

Every composed `.C` stage follows one stage-set shape:

```text
stage.C =
  system.planStageSet(stage)
  -> plugin.stage.C.task[*]
  -> system.admitStageTaskResult[*]
  -> system.writeStageLedgers(stage)
  -> system.collectStageSet(stage)
```

The ABG bind chain becomes:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(system.planTransformSet)
  .bind(plugin.transform.C.task[*])
  .bind(system.admitTransformTaskResult[*])
  .bind(system.writeTransformEventsAndLedgers)
  .bind(system.collectTransformSet)
  .bind(system.planEvaluationSet)
  .bind(plugin.evaluate.C.rule[*])
  .bind(system.admitEvaluationRuleResult[*])
  .bind(system.writeEvaluationLedgers)
  .bind(system.collectEvaluationSet)
  .bind(system.assuranceFold)
  .bind(system.planConsequenceSet)
  .bind(plugin.consequence.C.task[*])
  .bind(system.admitConsequenceTaskResult[*])
  .bind(system.collectConsequenceSet)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

The scalar legacy paths remain lawful reductions:

- scalar `fpDispatch` is one `transform.C.F_P` task
- scalar `FpEvaluationOutcome` is one `evaluate.C.F_P` semantic judgment rule
- scalar `consequenceProjection` is one `consequence.C.F_D` projection task

## Design Module Method

### IACS

The stage-set carrier family must be the Irreducible Architectural Carrier Set.
Specialized stage carriers may project from it, but they must not become rival
truth.

| Carrier | Owner | Purpose | Closure Authority |
| --- | --- | --- | --- |
| `ComposedStageSetPlan` | ABG | selected stage, selected composition identity, ordered/parallel task batches, required task refs, read-only input refs | none |
| `ComposedStageTaskDeclaration` | ABG | one transform/evaluate/consequence task with stage role, compute means, regime binding, inputs, outputs, dependency/batch refs | none |
| `ComposedStageTaskOutcome` | ABG | proposed task result refs and diagnostics under selected composition | none |
| `ComposedStageAdmission` | ABG | admitted, rejected, missing, stale, and contradictory stage task outcomes | none |
| `ComposedStageProjection` | ABG | stable fold input over admitted task outcomes for the next ABG system bind | none |
| `TransformSetProjection` | ABG projection | candidate/evidence/register refs produced by transform tasks | none |
| `EvaluationSetProjection` | ABG projection | register/finding/evidence/residual/continuation refs produced by evaluation tasks | none |
| `ConsequenceSetProjection` | ABG projection | downstream projection refs produced after assurance fold | none |

### Authority

- GTL declares selected composition and stage/task refs.
- Product plugins compute task outcomes inside the declared stage boundary.
- ABG admits every task outcome before it becomes runtime truth.
- ABG owns ledgers, projection, assurance fold, traversal transition,
  continuation, correction, replay, and closure.
- Plugins may not write ledgers, emit runtime events, select traversal, replay
  continuation, mutate graph call/frame state, or close.
- Parallel batches are lawful only over read-only admitted facts.
- Replay identity is determined by selected composition identity, task refs,
  batch/dependency refs, and admitted outcomes, not completion order.

### Design Constraints

- `evaluate.C` from T-145 remains the first specialization of the shared
  stage-set law.
- `transform.C` shall not be left as a privileged scalar runtime path.
- `consequence.C` shall not become an imperative product action stage.
- `F_H` remains an external callout boundary. A human-facing system may perform
  work and return a response, but ABG only consumes an admitted event/carrier.
- Compatibility adapters may only be one-task reductions with deletion-safe
  names; they shall not become second public carrier truth.

## Implementation Plan

1. Requirements and product law
   - Generalize compute notation from `evaluate.C` set phase to every composed
     `.C` stage.
   - Preserve the scalar one-task reductions explicitly.

2. Design carrier derivation
   - Add `M03_COMPOSED_C_STAGE_SET_DERIVATION.md`.
   - Map existing `EvaluationSet*` carriers as the first specialization.
   - Define transform and consequence specializations before code changes.

3. Generic stage-set contracts
   - Introduce shared stage-set task declaration, plan, outcome, admission, and
     projection carriers.
   - Preserve selected composition ref/digest, selection ref, selected regime
     binding ref, and contribution ref on every task outcome.
   - Reject engine authority fields on every task outcome.

4. Transform-set realization
   - Represent scalar `fpDispatch` as one `transform.C.F_P` task.
   - Add deterministic transform tasks for preparatory, extraction, data-shape,
     input-normalization, and static candidate construction work.
   - Allow parallel read-only transform batches where task outputs are admitted
     by ABG in stable order.
   - Fail closed when required transform tasks are missing, rejected, stale, or
     admitted under mismatched selected composition identity.

5. Evaluation-set convergence
   - Refactor `EvaluationSet*` to derive from or conform to the shared
     stage-set carriers.
   - Keep the T-145 proof lane green.

6. Consequence-set realization
   - Represent scalar `consequenceProjection` as one `consequence.C.F_D` task.
   - Keep consequence output as projection refs over admitted state, not
     runtime mutation authority.

7. Tests
   - Add `npm run test:t146`.
   - Prove scalar transform/evaluate/consequence reductions.
   - Prove `transform.C.F_D[]` runs before `transform.C.F_P[]` when declared.
   - Prove parallel transform tasks invoke concurrently and admit stably.
   - Prove transform/evaluate/consequence task outcomes cannot smuggle ABG
     authority.
   - Prove missing required transform and consequence tasks fail closed.
   - Run full semantic suite and lint.

## Acceptance Criteria

- [ ] Product and requirements state that every composed `.C` stage is a
  stage-set phase, with scalar calls as one-task reductions.
- [ ] Design module defines the shared stage-set IACS before transform-set code
  lands.
- [ ] `evaluate.C` T-145 carriers are mapped as the first specialization.
- [ ] `transform.C` supports deterministic task batches and F_P task batches
  under selected composition.
- [ ] `consequence.C` is represented as a projection task set and cannot mutate
  runtime truth.
- [ ] All task outcomes preserve selected composition identity and selected
  regime-binding contribution identity.
- [ ] Required stage tasks fail closed when absent, stale, malformed,
  contradictory, rejected, or mismatched.
- [ ] Parallel task execution is replay-stable and independent of wall-clock
  completion order.
- [ ] No plugin task can write ledgers, emit events, select traversal, replay
  continuation, mutate graph call/frame state, or close.
- [ ] Tests prove the scalar reductions and multi-task/parallel forms.

## Closure Law

This ticket closes only when transform, evaluate, and consequence all converge
through the shared composed-stage-set law. T-145 may close the evaluation
specialization, but T-146 remains open until the symmetry is realized across
the stage family.
