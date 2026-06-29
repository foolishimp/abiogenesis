# M03 Recursive Executive Observer Structural Carrier Diagram

**Status**: Ratified first slice
**Ticket**: T-160
**Date**: 2026-06-29

```text
GTL GraphFunction.environment
  + GTL Context(locator, digest)
  + GTL AssetSurface.requiredContexts
        |
        v
ABG replay/projection truth
  + runtime event refs
  + payload ledger refs
  + evidence refs
  + residual pressure refs
  + continuation refs
  + RequirementSpanLineageProjection
        |
        v
ExecutiveObservationView
  <<read-only projection>>
        |
        v
plugin.evaluate.C / F_P
  -> FpEvaluationOutcome
  -> FpEvaluationFinding[*]
        |
        v
ExecutivePressureFactProjection[*]
  <<read-only projection>>
        |
        v
ExecutiveContinuationInputProjection
  <<input to ABG continuation/re-entry/reprice/block projection>>
```

## Write Boundary

Only existing ABG admission and runtime event mechanisms may write runtime
truth. The executive observer projection module does not expose:

- event emitters;
- admitted-ref minting;
- ledger writers;
- worker invocation;
- continuation controllers;
- closure folds.

## Public Facade

`abg/executive` exports only:

- `projectExecutiveObservationView`
- `projectExecutivePressureFacts`
- `projectExecutiveContinuationInput`

The facade intentionally does not export `runExecutiveWorker`,
`emitExecutivePressure`, `writeExecutiveLedger`, or an executive admitted-ref
constructor.
