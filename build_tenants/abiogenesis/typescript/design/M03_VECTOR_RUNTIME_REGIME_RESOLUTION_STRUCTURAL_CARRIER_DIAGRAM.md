# M03 Vector Runtime Regime Resolution Structural Carrier Diagram

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-135

```mermaid
flowchart LR
  subgraph GTL["GTL Vector Surface"]
    D["GraphVector.declarations\nabg.runtime_regime"]
    O["Operator regimes"]
    E["Evaluator regimes"]
  end

  subgraph Policy["Runtime Policy Fallback"]
    P["ExecutionBasis.resolvedPolicy.defaultRegime"]
    Dispatch["dispatchRef"]
    Approval["approvalSubjectRef"]
  end

  subgraph Kernel["Pure ABG Resolution Kernel"]
    Input["RegimeResolutionInput\nbasis + vectorIndex"]
    Selected["EffectiveVectorRegime\nregime + source + ref"]
    Diagnostic["RegimeResolutionDiagnostic refs"]
  end

  subgraph Transition["ABG Advancement"]
    FD["fd_advance"]
    FP["fp_dispatch"]
    FH["fh_escalation"]
  end

  subgraph Events["Replay Event Spine"]
    Planned["vector_traversal_planned\nregime + source + diagnostics"]
  end

  D --> Input
  O --> Input
  E --> Input
  P --> Input
  Input --> Selected
  Input --> Diagnostic
  Selected --> FD
  Selected --> FP
  Selected --> FH
  Dispatch --> FP
  Approval --> FH
  Selected --> Planned
  Diagnostic --> Planned
```

## Authority Notes

- `GraphVector.declarations["abg.runtime_regime"]` is the direct
  vector-local declaration surface.
- Operator/evaluator regimes are vector-local participant truth.
- Basis default is fallback only; it may not override a homogeneous vector
  regime.
- Dispatch and approval refs are authority checks after regime selection, not
  regime selectors.
- `vector_traversal_planned` records the selected regime so replay sees the
  same decision that transition construction used.
