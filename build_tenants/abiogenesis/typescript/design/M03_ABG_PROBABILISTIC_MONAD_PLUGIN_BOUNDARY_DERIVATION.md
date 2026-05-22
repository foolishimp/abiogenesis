# M03 ABG Probabilistic Monad Plugin Boundary Derivation

Status: active
Derives: T-144, T-143, REQ-L-GTL3-COMPUTE-NOTATION, REQ-R-ABG3-FN-COMPOSITION, REQ-R-ABG3-ASSURANCE, REQ-R-ABG3-PAYLOAD

## Claim

ABG is the event-sourced monad over selected GTL composition. It is opinionated
for probabilistic eventual consistency, while a fully deterministic `F_D` graph
is a valid reduction of the same bind chain.

The executable shape is:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(plugin.transform.C)
  .bind(system.admitTransform)
  .bind(system.writeTransformEventsAndLedgers)
  .bind(plugin.evaluate.C)
  .bind(system.admitEvaluation)
  .bind(system.writeEvaluationLedgers)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

## IACS

| Carrier | Owner | Purpose | Closure Authority |
| --- | --- | --- | --- |
| `GtlFunctionCompositionNotation` | GTL | typed notation over `GraphFunction`, `Job`, optional `GraphVector`, and selected composition | none |
| `GtlComputePluginCategoryBinding` | GTL | category typing for transform, evaluate, consequence, and human-callout compute | none |
| `EnginePluginContract` | ABG | admitted plugin contract with compute stage role, means, purpose, and denied engine authority flags | none |
| `EngineComputeStageBinding` | ABG | invocation-time selected composition identity plus stage category and regime binding ref | none |
| `EnginePluginInput` | ABG | one plugin invocation input carrying composition identity, stage binding, projection, policy, assurance, and traversal context | none |
| `HookActionRecord` / `HookFindingAdmission` | ABG | replay-visible plugin hook output admission chain | none |
| Payload and evidence events | ABG | admitted runtime facts projected into payload ledgers and assurance | none |
| Assurance projection and closure fold | ABG | deterministic fold over admitted evidence and policy | ABG only |
| Traversal transition and replay continuation | ABG | selected next runtime transition and continuation replay | ABG only |

## Boundary Law

Plugin stages compute values. ABG.system writes facts.

- `plugin.transform.C` may produce candidate/evidence payloads.
- `plugin.evaluate.C` may produce evaluation findings, gain refs, residual
  pressure refs, continuation refs, evidence refs, authority refs, diagnostics,
  and proposed disposition.
- `plugin.consequence.C` may produce product read-model projection refs over
  ABG-admitted state.
- No plugin may write ledgers, emit runtime events, select traversal, own replay,
  or close.

`F_H` is external to the system. ABG may emit or admit a human-callout boundary
and later admit a response event/carrier. The human-facing work surface is not
an ABG plugin performing human work inside the runtime.

## Realization Mapping

- `gtl/m02/contracts/compute_notation.ts` exposes
  `GtlComputePluginCategoryBinding`.
- `abg/m03/contracts/plugins.ts` exposes compute stage category on
  `EnginePluginContract` and `EngineComputeStageBinding` on
  `EnginePluginInput`.
- `abg/m03/contracts/plugin_traversal_observer.ts` uses stage names
  `transform`, `evaluate`, and `consequence`.
- `abg/m03/contracts/hook_actions.ts` uses `evaluate` as the hook action class
  for evaluation-stage findings.
- `abg/m03/runner/engine_runner.ts` remains the authority that admits plugin
  outputs, emits events, folds assurance, transitions traversal, and replays
  continuation.

## Negative Proof

The implementation must reject:

- stage category contradictions against known plugin kinds;
- `F_H` as an internal transform/evaluate/consequence compute regime;
- plugin outcomes containing runtime events, ledger writes, transitions, vector
  selection, closure, graph call, frame, or actor authority;
- fallback bundles that omit any stage observer row;
- hook actions using a legacy ambiguous stage category for admitted evaluation
  findings.

## Verification

`test_t144_abg_probabilistic_monad_plugin_boundary.test.mjs` proves stage
category typing, selected composition identity, external `F_H` callout semantics,
and malformed-category failure.
