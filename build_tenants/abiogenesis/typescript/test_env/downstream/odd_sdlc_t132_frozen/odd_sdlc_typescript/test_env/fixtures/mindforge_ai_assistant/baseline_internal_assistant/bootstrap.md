# MindForge AI Assistant Baseline Bootstrap

This fixture defines a synthetic internal GenAI assistant use case for a
regulated financial organisation. It is declaration data for the scenario
sandbox. It must not contain generated implementation output.

## Project Intent

Build `mindforge-ai-assistant-governance`, a minimal JavaScript governance
control product under:

```text
build_tenants/mindforge_ai_assistant/
```

The product accepts one use-case record and emits a governance-state projection
for MindForge-style AI use-case controls.

## Synthetic Use Case

- use case id: `MF-AI-001`
- source variant: `baseline_internal_assistant`
- assistant type: internal staff productivity assistant
- users: operations staff
- data sensitivity: internal policy and procedure content
- customer impact: none
- external model/provider dependency: none
- autonomy: draft assistance only
- material change: none

## MindForge Pressure

This baseline represents a governed but moderate-risk internal assistant. It
must be registered in the AI inventory, routed through pre-deployment review,
monitored for unsupported answers, and recertified annually or after material
change.

## Expected Governance Projection

The generated app must emit exactly this compact JSON object after parsing its
generated example input:

```json
{"useCaseId":"MF-AI-001","inventoryStatus":"registered","riskTier":"moderate","controlPath":"enhanced_review","preDeploymentGate":"pending_ai_risk_review","monitoring":["unsupported_answer_rate","policy_content_staleness"],"thirdPartyDisclosureRequired":false,"recertification":"annual_or_material_change","sourceVariant":"baseline_internal_assistant"}
```

## Forbidden Shortcuts

- Do not write product source into the fixture.
- Do not use real customer, employee, vendor, or model data.
- Do not make MindForge concepts ABG core carriers.
- Do not treat generated inventory, risk, KRI, or audit outputs as writable
  source truth.
