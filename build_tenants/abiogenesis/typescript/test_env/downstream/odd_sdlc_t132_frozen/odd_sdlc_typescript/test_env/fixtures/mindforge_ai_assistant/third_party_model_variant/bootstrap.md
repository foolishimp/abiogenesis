# MindForge AI Assistant Third-Party Model Variant Bootstrap

This fixture defines the same internal assistant as the baseline, but with an
external foundation-model/provider dependency. It is declaration data and must
not contain generated implementation output.

## Project Intent

Build `mindforge-ai-assistant-governance` under:

```text
build_tenants/mindforge_ai_assistant/
```

The generated app must make third-party model pressure visible in the governance
projection.

## Synthetic Use Case

- use case id: `MF-AI-001`
- source variant: `third_party_model_variant`
- assistant type: internal staff productivity assistant
- users: operations staff
- data sensitivity: internal policy and procedure content
- customer impact: none
- external model/provider dependency: `Contoso Foundation Model Service`
- admitted evidence: `evidence/third_party_ai_card.md`
- autonomy: draft assistance only
- material change: provider introduced before deployment

## MindForge Pressure

The variant adds third-party AI disclosure and vendor/provider review pressure.
The control path must include third-party risk review, provider disclosure must
be required, and model/provider change monitoring must be visible.

## Expected Governance Projection

```json
{"useCaseId":"MF-AI-001","inventoryStatus":"registered","riskTier":"moderate","controlPath":"third_party_enhanced_review","preDeploymentGate":"pending_vendor_ai_risk_review","monitoring":["unsupported_answer_rate","policy_content_staleness","third_party_model_change"],"thirdPartyDisclosureRequired":true,"recertification":"annual_or_provider_change","sourceVariant":"third_party_model_variant"}
```

## Forbidden Shortcuts

- Do not write product source into the fixture.
- Do not use real vendor or model data.
- Do not collapse third-party disclosure into invocation transport.
- Do not make MindForge concepts ABG core carriers.
