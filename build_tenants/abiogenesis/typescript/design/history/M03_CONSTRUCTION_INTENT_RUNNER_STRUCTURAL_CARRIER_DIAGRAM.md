# M03 Construction Intent Runner Structural Carrier Diagram

```text
ConstructionRuntimeEvents
  -> admitConstructionRuntimeEvents
  -> selected AdmittedConstructionIntent
  -> ConstructionRuntimeEffectPlan
  -> construction_graph_action_invoked
  -> runEngineIterate(selected graph basis)
  -> construction_delta_observed
  -> ConstructionProgressLedger
  -> ConstructionProjection
```

## Carrier Roles

`AdmittedConstructionIntent`
: Selected graph action authority. It names the graph function, action,
binding, outcome, lineage, and admission decision.

`ConstructionRuntimeEffectPlan`
: Runner-local plan for one graph action attempt. It records before projection,
runtime projection, graph call/frame ids, event sequence, and attempt ordinal.

`ConstructionGraphActionInvokedEvent`
: Replay-visible proof that ABG, not CLI or public gaps, invoked the selected
graph action.

`ConstructionDeltaObservedEvent`
: Replay-visible result of the graph action attempt. It binds runtime evidence
back to the admitted construction intent.

`ConstructionRunnerStepOutcome`
: Public runner result for one admitted construction step. It carries emitted
events, replay events, progress ledger, and resulting construction projection.

`ConstructionProjection`
: Deterministic read model derived after event admission. It is the only next
construction state exposed by this slice.
