# MindForge AI Assistant Fixture Family

This fixture family is declaration data for T-163. It is used by the scenario
sandbox to build a small MindForge-governed AI assistant control product inside
a fresh installed `odd_sdlc` workspace.

The fixture files are source truth for scenario pressure only. They do not
include generated product implementation files under
`build_tenants/mindforge_ai_assistant/`.

Variants:

- `baseline_internal_assistant`: internal productivity assistant with no
  customer-impacting decisioning.
- `third_party_model_variant`: same assistant with a third-party model/provider
  dependency and provider disclosure evidence.
- `high_risk_customer_impact_variant`: assistant output can influence regulated
  customer workflows.
- `material_change_recertification_variant`: governed assistant with a material
  model/provider/scope change requiring recertification re-entry.

The generated product target for every variant is:

```text
build_tenants/mindforge_ai_assistant/
```

The generated app is expected to emit a JSON governance-state projection from a
variant-specific use-case record. Inventory, risk, KRI, disclosure, and
recertification outputs are projections over admitted scenario facts, not
writable authority surfaces.
