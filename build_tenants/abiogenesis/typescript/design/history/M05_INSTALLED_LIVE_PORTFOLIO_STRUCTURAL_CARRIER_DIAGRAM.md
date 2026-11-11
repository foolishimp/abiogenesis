# M05 Installed Live Portfolio Structural Carrier Diagram

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md](./M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md), [M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md](./M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md), [T-031](../../.ai-workspace/tickets/completed/T-031-realize-typescript-m05-installed-live-scenario-portfolio-parity-against-the-python-sandbox-live-reference-line.md)

```mermaid
classDiagram

class InstalledSandboxQualificationPassed {
  <<authoritative>>
  <<upstream>>
  +kind: "passed"
  +lane
  +trace
}

class InstalledLiveScenarioPortfolioRequest {
  <<prime>>
  <<authoritative>>
  +installedQualification
  +scenarios
}

class InstalledLiveScenarioPortfolioOutcome {
  <<prime>>
  <<authoritative>>
}

class InstalledLiveScenarioResult {
  <<subordinate>>
  +scenarioName
  +scenarioAuthorityRefs
  +mode
  +stages
  +stageCount
  +maxAssessmentCount
  +passed
  +emittedEventKinds
  +finalRunStatus
}

class InstalledLiveScenarioStageResult {
  <<subordinate>>
  +handle
  +edge
  +sourceKind
  +targetKind
  +assetHandle
  +assessmentIds
}

class InstalledLiveScenarioPortfolioGapRef {
  <<subordinate>>
  +kind
  +ref
}

class M05ReferenceLiveScenarioObligation {
  <<subordinate>>
  <<authoritative>>
  +scenarioName
  +requiredAuthorityRefs
  +mode
  +stages
  +minStageCount
  +minAssessmentCount
}

class M05ReferenceObligation {
  <<subordinate>>
  <<authoritative>>
  +id
  +source
  +state
  +requirementRefs
  +sourceRefs
  +proofRefs
  +rationale
}

InstalledLiveScenarioPortfolioRequest --> InstalledSandboxQualificationPassed : consumes upstream
InstalledLiveScenarioPortfolioRequest *-- InstalledLiveScenarioResult
InstalledLiveScenarioResult *-- InstalledLiveScenarioStageResult
M05ReferenceLiveScenarioObligation *-- InstalledLiveScenarioStageResult : required stage shape
InstalledLiveScenarioPortfolioRequest --> M05ReferenceLiveScenarioObligation : must satisfy
M05ReferenceObligation --> M05ReferenceLiveScenarioObligation : indexes live-family proof
InstalledLiveScenarioPortfolioOutcome *-- InstalledLiveScenarioPortfolioGapRef
InstalledLiveScenarioPortfolioRequest --> InstalledLiveScenarioPortfolioOutcome : qualifies
```
