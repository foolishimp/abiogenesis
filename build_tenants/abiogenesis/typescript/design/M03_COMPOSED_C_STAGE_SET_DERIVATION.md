# M03 Composed C Stage-Set Derivation

Status: active
Derives: T-146, T-145, T-144, REQ-L-GTL3-COMPUTE-NOTATION, REQ-R-ABG3-FN-COMPOSITION, REQ-R-ABG3-PAYLOAD, REQ-R-ABG3-ASSURANCE

## Claim

Every composed `.C` stage is a stage-set phase under selected
`abg.fn_composition`. A scalar stage plugin is the one-task reduction of the
same phase.

```text
stage.C =
  system.planStageSet(stage)
  -> plugin.stage.C.task[*]
  -> system.admitStageTaskResult[*]
  -> system.writeStageLedgers(stage)
  -> system.collectStageSet(stage)
```

This applies to `transform.C`, `evaluate.C`, and `consequence.C`. `F_H` remains
an external callout boundary and never becomes internal human work.

## IACS

| Carrier | Owner | Purpose | Closure Authority |
| --- | --- | --- | --- |
| `ComposedStageSetPlan` | ABG | selected stage, selected composition identity, ordered/parallel task batches, required task refs, read-only input refs | none |
| `ComposedStageTaskDeclaration` | ABG | one stage task with stage role, compute means, selected regime binding, input refs, output refs, dependency refs, batch refs | none |
| `ComposedStageTaskOutcome` | ABG | proposed task result refs, diagnostics, selected composition identity, and selected contribution identity | none |
| `ComposedStageAdmission` | ABG | admitted, rejected, missing, stale, and contradictory stage task outcomes | none |
| `ComposedStageProjection` | ABG | stable fold input over admitted task outcomes for the next ABG system bind | none |
| `TransformSetProjection` | ABG projection | admitted candidate, evidence, register, and transform-result refs | none |
| `EvaluationSetProjection` | ABG projection | admitted register, finding, evidence, residual, and continuation refs | none |
| `ConsequenceSetProjection` | ABG projection | admitted consequence and downstream read-model projection refs | none |

The IACS boundary is the shared stage-set carrier family. Stage-specific
carriers may be projections or specializations, but they must not become rival
sources of runtime truth.

## Bind Chain

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

## Reductions

- `fpDispatch` is the one-task `transform.C.F_P` reduction.
- `FpEvaluationOutcome` is the one-rule `evaluate.C.F_P` reduction.
- `consequenceProjection` is the one-task `consequence.C.F_D` reduction.

These reductions preserve compatibility only when ABG still owns planning,
admission, event writes, ledgers, assurance, traversal, and replay.

## Stage Specializations

### transform.C

`transform.C` produces candidate/evidence payloads. It may contain
deterministic tasks for input normalization, extraction, schema-derived
candidate construction, static data shaping, or preparatory register creation.
It may contain F_P tasks for ambiguous construction. Multiple F_P transform
tasks require declared candidate/fan-in or selection law before their outputs
can become a single transform basis.

### evaluate.C

`evaluate.C` consumes admitted transform truth plus read-only ledgers. T-145 is
the first realized specialization. F_D register rules may run in ordered or
parallel batches before the F_P semantic judgment rule.

### consequence.C

`consequence.C` projects product-facing consequence refs over admitted ABG
state after assurance fold. It is not an imperative action stage. It cannot
write runtime truth, select traversal, or close.

## Runtime Law

- Stage tasks are read-only over workspace/runtime state.
- Stage tasks return typed outcomes for ABG admission.
- ABG rejects task outcomes that claim runtime events, ledger writes, graph
  call/frame mutation, vector selection, traversal transition, continuation
  replay, or closure.
- Required tasks fail closed when absent, stale, malformed, contradictory,
  rejected, or admitted under mismatched selected composition identity.
- Parallel batches invoke concurrently only when their declared inputs are
  read-only and outputs are ABG-admitted values.
- Replay order is stable by plan batch order and task ref order, never
  wall-clock completion order.

## Realization State

T-145 realizes `evaluate.C` as `EvaluationSetPlan`,
`EvaluationRuleDeclaration`, `EvaluationRuleOutcome`,
`EvaluationSetAdmission`, and `EvaluationSetProjection`.

T-146 remains open for the shared carrier family and transform/consequence
specializations.
