# M03 F_D Authority Placement Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-138

```mermaid
flowchart LR
  subgraph GTL["GTL Evaluator Truth"]
    Eval["Evaluator\nregime + binding"]
    Consumed["consumedFieldRefs"]
  end

  subgraph Plugin["F_D Evaluator Effect"]
    Evidence["evidenceRefs"]
    Severity["severityClass"]
    Affected["affectedFieldRefs"]
    Reason["reason / raw diagnostics"]
  end

  subgraph Admission["ABG Admission Kernel"]
    Route["FdPressureRoutingDecision"]
    Outcome["FdEvaluationOutcome\nadmitted authority placement"]
    Diag["FdAuthorityDiagnostic refs"]
    Pressure["pressureRefs"]
  end

  subgraph Events["Runtime Event Spine"]
    Event["fd_authority_outcome_admitted"]
  end

  subgraph Runner["ABG Runner"]
    Continue["continue / close vector"]
    Block["block gap_stop"]
    Preserve["preserve pressure + continue"]
    RouteFp["yield to F_P pressure"]
  end

  Eval --> Consumed
  Consumed --> Route
  Severity --> Route
  Affected --> Route
  Evidence --> Outcome
  Reason --> Outcome
  Route --> Outcome
  Route --> Diag
  Route --> Pressure
  Outcome --> Event
  Event --> Continue
  Event --> Block
  Event --> Preserve
  Event --> RouteFp
```

## Authority Notes

- `Evaluator.consumedFieldRefs` is admitted GTL truth.
- Raw validator diagnostics remain subordinate until admitted as severity,
  affected fields, evidence refs, diagnostics, or pressure refs.
- Plugins may report severity and affected fields; ABG derives routing.
- `diagnostic_shape_invalid` only blocks when the malformed field is in the
  consumed-field set.
- `content_unproven` does not become deterministic closure failure; it routes
  to F_P/content pressure.
