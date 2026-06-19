# MindForge Governance Output Requirements

**Status**: Active
**Derived From**: `T-163 material_change_recertification_variant`

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

For the material-change variant, the projection shall use
`controlPath: "recertification_review"` and
`recertification: "reopened_due_to_material_change"`.
