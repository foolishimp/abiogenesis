# M03 Observed State Admission Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-136

```mermaid
flowchart LR
  subgraph External["Effect Shell Inputs"]
    File["workspace file"]
    Register["register JSON"]
    Projection["derived projection"]
    Watermark["event-spine watermark"]
    Policy["policy/config value"]
  end

  subgraph Admission["Observed-State Admission"]
    Source["ObservedStateSourceRef\nkind + scopeRef + sourceRef"]
    Basis["ObservedStateDerivationBasis\nbasisProjectionRef + watermark + derivedFromRefs"]
    Record["ObservedStateRecord\ndigest + version + freshnessPolicyRef"]
    Outcome["ObservedStateAdmissionOutcome\nadmitted | rejected + diagnostics"]
  end

  subgraph Events["Runtime Event Spine"]
    Event["observed_state_admitted"]
    ProjectionOut["ObservedStateProjection\nrecords + latest watermark"]
  end

  subgraph Construction["Construction Observation"]
    Snapshot["ConstructionObservationSnapshot\nobservedStateRefs"]
    Coverage["coverage check\nrefs must be admitted"]
  end

  subgraph Consumers["Future Consumers"]
    Selection["construction selection"]
    Fire["overlay fire_when"]
    Terminate["overlay terminate_when"]
    Pressure["pressure projection"]
    Close["routing / closure"]
  end

  File --> Source
  Register --> Source
  Projection --> Source
  Watermark --> Source
  Policy --> Source
  Source --> Record
  Basis --> Record
  Record --> Outcome
  Outcome --> Event
  Event --> ProjectionOut
  ProjectionOut --> Coverage
  Snapshot --> Coverage
  Coverage --> Selection
  ProjectionOut --> Fire
  ProjectionOut --> Terminate
  ProjectionOut --> Pressure
  ProjectionOut --> Close
```

## Authority Notes

- Effect-shell reads are ingress data. They are not runtime truth until admitted
  as `ObservedStateRecord`.
- `observed_state_admitted` is the replay-visible event boundary.
- `ObservedStateProjection` is the stable read model consumed by construction
  snapshots and later overlay frames.
- `ConstructionObservationSnapshot.observedStateRefs` prevents selection context
  from hiding private controller reads.
- Stale or mismatched observations reject before they can affect selection,
  routing, pressure projection, or closure.
- Process cwd and in-memory controller variables are excluded unless a governed
  predicate declares them and admits them through the observed-state carrier.
