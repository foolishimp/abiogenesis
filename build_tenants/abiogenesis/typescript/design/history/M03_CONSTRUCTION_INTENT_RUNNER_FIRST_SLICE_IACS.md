# M03 Construction Intent Runner First Slice IACS

## Irreducible Architectural Carrier Set

- `AdmittedConstructionIntent`
- `ConstructionRuntimeEffectPlan`
- `ConstructionGraphActionInvokedEvent`
- `ConstructionDeltaObservedEvent`
- `ConstructionRunnerStepOutcome`
- `ConstructionProjection`

## Promotion Test

A value is promoted to the IACS only if it independently constrains one of:

- which admitted intent may run;
- which graph function is invoked;
- which runtime effect is emitted;
- which replay-derived construction projection results.

## Subordinate Payloads

These remain subordinate:

- attached worker result artifact details;
- graph runner plugin input rows;
- runtime event display rows;
- test fixture identities;
- CLI or public-gaps output payloads.

## First Slice Boundary

The first slice proves one selected admitted intent over a synthetic mixed
F_P/F_D graph. The runner emits graph-action invocation and delta events,
replays construction progress, and returns the new construction projection.
