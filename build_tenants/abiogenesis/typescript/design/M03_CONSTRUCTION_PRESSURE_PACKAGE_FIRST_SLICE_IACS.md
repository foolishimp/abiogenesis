# M03 Construction Pressure Package First Slice IACS

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-139

## Irreducible Architectural Carrier Set

1. `ConstructionPressurePackage`
   The replay-stable package of current construction pressure delivered to the
   next mixed-regime graph action. It is the one authority surface for pressure
   context at the F_P boundary.

2. `ConstructionPressureInputBasis`
   The complete derivation basis: observation, construction projection, runtime
   projection, overlay frame projection, selected intent/action/outcome,
   execution target, observed state, F_D outcomes, overlay frames, target state,
   prior evidence, and obligation policy.

3. `ConstructionPressureRef`
   The selected pressure row that must survive until evidence clears it. It
   binds pressure kind, source ref, target outcome refs, evidence refs, and
   authority refs.

4. `ConstructionPressureClearanceEvidence`
   The evidence row that can justify clearing pressure. The first slice derives
   clearing through closed construction deltas and records evidence refs in the
   projection.

5. `ConstructionPressurePackageAdmission`
   The typed admission outcome for package identity, observed-state presence,
   and pressure presence.

6. `ConstructionPressureProjection`
   The replay-derived read model that records package refs, latest package,
   open pressure refs, cleared pressure refs, and clearance evidence refs.

7. `construction_pressure_package_materialized`
   The runtime event that makes package materialization replay truth before the
   graph action is invoked.

## Subordinate Payloads

Subordinate payloads in this slice:

- rendered worker prompt sections;
- product-specific pressure labels;
- raw validator messages;
- display-only package summaries;
- fixture-specific target rows;
- adapter formatting for external agents.

These payloads may explain or render the package. They do not become pressure
truth and cannot clear pressure.

## Promotion Test

Promote a field into the pressure package only if a runner, F_P plugin
boundary, deterministic follow-up, pressure projection, closure predicate, or
downstream deletion proof reads it. Otherwise keep it subordinate.

## Effect Edges

```text
ConstructionObservationSnapshot
  + AdmittedConstructionIntent
  + ConstructionActionCatalogProjection
  + ConstructionProjection
  + RuntimeAggregateProjection
  + fd_authority_outcome_admitted events
  -> ConstructionPressurePackage
  -> construction_pressure_package_materialized
  -> EnginePluginInput.constructionPressurePackage
  -> graph action result
  -> construction_delta_observed
  -> ConstructionPressureProjection
```

## First Slice Proof

The first slice is complete when:

- package admission rejects missing observed state or missing pressure;
- a materialized event carries package identity and selected intent identity;
- a mixed F_P plus F_D graph action receives the structured package;
- open pressure survives after package materialization;
- closed construction delta evidence clears the selected pressure;
- prompt rendering is not required for any assertion.

## Batch Completion Proof

The substrate batch is not fully closed by this first slice alone. T-139's final
closure law also requires a downstream deletion proof naming product-local loop
authority replaced by this substrate.

## Module Boundary

The pressure package first slice is deliberately not owned by
`fp_consciousness.ts` as a semantic center. The module split is:

- `construction_observation.ts`: current-state observation and pressure rows;
- `construction_event_causality.ts`: replay ordering and causality validation;
- `construction_pressure_package.ts`: package derivation, admission,
  materialized event, and pressure projection;
- `fp_consciousness.ts`: construction composition and compatibility exports.
