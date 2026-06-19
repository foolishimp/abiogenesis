# MindForge AI Assistant Material Change Recertification Variant Bootstrap

This fixture defines an already governed assistant with a material model,
provider, data, or use-scope change. It is synthetic declaration data and must
not contain generated implementation output.

## Project Intent

Build `mindforge-ai-assistant-governance` under
`build_tenants/mindforge_ai_assistant/`.

## Synthetic Use Case

- use case id: `MF-AI-003`
- source variant: `material_change_recertification_variant`
- assistant type: internal staff productivity assistant
- users: operations staff
- data sensitivity: internal policy and procedure content
- customer impact: none
- external model/provider dependency: none
- material change: retrieval scope expanded to new policy corpus
- prior status: approved baseline use case

## MindForge Pressure

The variant proves that prior approval is not enough after material change. The
governance projection must reopen recertification and make change evidence
visible rather than patching runtime output.

## Expected Governance Projection

```json
{"useCaseId":"MF-AI-003","inventoryStatus":"registered_material_change","riskTier":"moderate","controlPath":"recertification_review","preDeploymentGate":"pending_material_change_recertification","monitoring":["unsupported_answer_rate","policy_content_staleness","material_change_completion"],"thirdPartyDisclosureRequired":false,"recertification":"reopened_due_to_material_change","sourceVariant":"material_change_recertification_variant"}
```

## Forbidden Shortcuts

- Do not write product source into the fixture.
- Do not treat prior approval as current approval.
- Do not patch generated output without preserving re-entry evidence.
- Do not make MindForge concepts ABG core carriers.
