# MindForge AI Assistant High-Risk Customer Impact Variant Bootstrap

This fixture defines an assistant whose output can influence regulated customer
or advice workflows. It is synthetic declaration data and must not contain
generated implementation output.

## Project Intent

Build `mindforge-ai-assistant-governance` under
`build_tenants/mindforge_ai_assistant/`.

## Synthetic Use Case

- use case id: `MF-AI-002`
- source variant: `high_risk_customer_impact_variant`
- assistant type: regulated workflow assistant
- users: relationship managers and advice operations staff
- data sensitivity: internal policy and customer-impacting workflow context
- customer impact: output may influence regulated customer workflow decisions
- external model/provider dependency: none
- autonomy: recommendation drafting with mandatory human-over-the-loop
- material change: none

## MindForge Pressure

The variant raises inherent risk because output can affect customer outcomes.
The control path must be stronger than baseline, senior approval must be
pending, and residual risk assessment must block deployment until review.

## Expected Governance Projection

```json
{"useCaseId":"MF-AI-002","inventoryStatus":"registered","riskTier":"high","controlPath":"senior_committee_review","preDeploymentGate":"pending_senior_ai_committee_approval","monitoring":["unsupported_answer_rate","customer_impact_override_rate","residual_risk_open_items"],"thirdPartyDisclosureRequired":false,"recertification":"semi_annual_or_material_change","sourceVariant":"high_risk_customer_impact_variant"}
```

## Forbidden Shortcuts

- Do not write product source into the fixture.
- Do not use real customer data.
- Do not let committee approval override deterministic failure.
- Do not make MindForge concepts ABG core carriers.
