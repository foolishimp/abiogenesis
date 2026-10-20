# M03 Construction Pressure Package Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-139

```mermaid
flowchart LR
  subgraph Inputs["Admitted / Projected Input Truth"]
    Obs["ConstructionObservationSnapshot\nobserved state + pressure rows"]
    Intent["AdmittedConstructionIntent\nselected action/outcome"]
    Catalog["ConstructionActionCatalogProjection"]
    CProj["ConstructionProjection"]
    RProj["RuntimeAggregateProjection\nobservedState + overlayFrame"]
    Fd["fd_authority_outcome_admitted"]
  end

  subgraph Package["Pressure Package Kernel"]
    Basis["ConstructionPressureInputBasis"]
    Pressure["ConstructionPressureRef[]"]
    ClearRows["ConstructionPressureClearanceEvidence[]"]
    Pkg["ConstructionPressurePackage\npackageRef + digest"]
    Admission["ConstructionPressurePackageAdmission"]
  end

  subgraph Events["Runtime Event Spine"]
    Materialized["construction_pressure_package_materialized"]
    Invoked["construction_graph_action_invoked"]
    Delta["construction_delta_observed"]
  end

  subgraph Runner["ABG Construction Runner"]
    PluginInput["EnginePluginInput\nstructured pressure package"]
    GraphAction["runEngineIterate"]
  end

  subgraph Projection["Replay Projection"]
    PProj["ConstructionPressureProjection"]
    Open["openPressureRefs"]
    Cleared["clearedPressureRefs"]
    Evidence["clearanceEvidenceRefs"]
  end

  Obs --> Basis
  Intent --> Basis
  Catalog --> Basis
  CProj --> Basis
  RProj --> Basis
  Fd --> Basis
  Obs --> Pressure
  Basis --> Pkg
  Pressure --> Pkg
  ClearRows --> Pkg
  Pkg --> Admission
  Admission --> Materialized
  Materialized --> PluginInput
  Materialized --> Invoked
  PluginInput --> GraphAction
  GraphAction --> Delta
  Materialized --> PProj
  Delta --> PProj
  PProj --> Open
  PProj --> Cleared
  PProj --> Evidence
```

## Authority Notes

- The package derives from admitted or projected runtime truth only.
- Prompt text and display summaries are subordinate renderings.
- `construction_pressure_package_materialized` must precede graph action
  invocation so the action is causally bound to the pressure it received.
- Pressure opens when the package is materialized.
- Pressure clears only from replayed construction delta evidence for the same
  selected intent.
- The downstream product may consume and render the package, but must not own a
  rival pressure package reconstruction path.
