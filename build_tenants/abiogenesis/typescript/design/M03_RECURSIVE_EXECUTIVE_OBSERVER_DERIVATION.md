# M03 Recursive Executive Observer Derivation

**Status**: Ratified first slice
**Ticket**: T-160
**Date**: 2026-06-29

## Problem

Downstream ODD products need recursive pressure preservation over admitted
graph work. If that role lives in the downstream product it becomes a local
controller. If deterministic code reconstructs pressure from product syntax it
becomes a semantic compiler. ABG must own the generic observer role.

## Derived Shape

The executive observer is an ABG graph function over a declared target
workspace and target work:

```text
abg.executive.GraphFunction(environment: target.workspace -> target_work)
```

The target workspace is declared through existing GTL surfaces:

- `GraphFunction.environment`
- `Context.locator`
- `Context.digest`
- `AssetSurface.requiredContexts`

ABG projects an immutable observation view from replay truth:

- selected graph-function/vector/composition refs
- workspace context locator and digest
- frame and span-lineage refs
- replay event refs
- payload ledger refs
- evidence refs
- residual pressure refs
- continuation refs
- requirement ids

The F_P executive evaluator consumes that view and returns normal
`evaluate.C` findings. ABG projects those findings into executive pressure
facts and then into continuation input. The observer never mutates the target
workspace and never writes runtime truth directly.

## Authority Boundary

Allowed:

- read replay-derived observation truth
- invoke F_P evaluation through governed worker transport
- admit findings as pressure facts
- classify attenuation, non-attenuation, local repair, nonlocal re-entry,
  reprice, block, and close-candidate state
- feed projected pressure into ABG continuation/re-entry/reprice/block

Forbidden:

- product-local observer loop
- `consequence.C` as semantic executive
- F_D semantic reconstruction from unknown product syntax
- direct event emission by the observer
- ledger writes by the observer
- target workspace mutation by the observer
- new workspace or observation carrier ontology
- closure authority in F_P findings

## First-Slice Resolution

The first slice adds `executive_observer.ts` under M03 contracts and a narrow
`abg/executive` facade. The facade exposes projection functions only:

- `projectExecutiveObservationView`
- `projectExecutivePressureFacts`
- `projectExecutiveContinuationInput`

The code reuses existing `FpEvaluationFinding`, `FpEvaluationOutcome`, and
`RequirementSpanLineageProjection` carriers. The new shapes are subordinate
read-model projections, not writable truth.

## Proof

Synthetic proof:

```bash
npm run test:t160
```

Live proof:

```bash
npm run test:t160:live
```

The live proof invokes a governed live F_P worker, admits the returned
evaluation finding, rejects runtime-authority fields, projects nonlocal
re-entry pressure, and writes a digest-pinned executive observer artifact.
