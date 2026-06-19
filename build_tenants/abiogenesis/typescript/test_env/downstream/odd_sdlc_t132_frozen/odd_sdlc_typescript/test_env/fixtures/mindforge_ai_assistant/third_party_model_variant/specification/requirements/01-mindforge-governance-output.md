# MindForge Governance Output Requirements

**Status**: Active
**Derived From**: `T-163 third_party_model_variant`

## REQ-MF-001

The product shall provide one executable JavaScript entrypoint at
`build_tenants/mindforge_ai_assistant/src/index.js`.

## REQ-MF-002

The product shall provide one example use-case record at
`build_tenants/mindforge_ai_assistant/examples/use_case.json`.

## REQ-MF-003

Running the declared Node command shall emit one compact JSON governance-state
projection with fields `useCaseId`, `inventoryStatus`, `riskTier`,
`controlPath`, `preDeploymentGate`, `monitoring`,
`thirdPartyDisclosureRequired`, `recertification`, and `sourceVariant`.

## REQ-MF-004

For the third-party model variant, the projection shall use
`controlPath: "third_party_enhanced_review"`, require third-party disclosure,
and include `third_party_model_change` in monitoring.
