# T-075 Add Live Semantic Generation UAT Proof Over Nonce-Bound Derived Content

- id: T-075
- title: Add live semantic generation UAT proof over nonce-bound derived content
- type: task
- ticket_category: rc_quality_gate
- status: completed
- build_tenant: typescript
- goal: prove-live-fp-generation-quality-not-only-transport-admission
- change_intent: Add a live UAT proof that requires the F_P worker to synthesize challenge-specific UAT content from source requirements, not only echo a supplied result-artifact skeleton.
- change_class: realization_refactor
- re_entry_point: m05_rc_live_uat_quality_lane
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- created_at: 2026-04-26
- activated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-033
  - T-074
- affected_boundary: `build_tenants/abiogenesis/typescript/test_env/live/test_m05_rc_live_uat.test.mjs`, `build_tenants/abiogenesis/typescript/design/M05_RC_LIVE_UAT_DERIVATION.md`, RC evidence docs
- intake_source: operator challenge that prior live tests proved external transport/admission but not live semantic generation quality.
- target_truth: The live UAT lane includes a nonce-bound semantic challenge where the worker derives UAT cases from source requirements, and deterministic checks reject artifacts that do not preserve nonce, coverage, generated cases, negative-case semantics, lineage semantics, and evidence refs.
- superseded_truth: RC live UAT only needs to prove that a real worker can return an over-constrained JSON artifact accepted by result assessment.

## Realization

`test_m05_rc_live_uat.test.mjs` now has two live tests:

1. transport/admission UAT: proves real F_P transport returns an admitted
   result artifact.
2. semantic-generation UAT: gives the worker fresh nonce-bound `data_mapper`
   requirements and requires synthesized UAT content inside
   `fulfillment_detail`.

The semantic evaluator checks:

- nonce preservation
- exact coverage of `REQ-DM-INGEST`, `REQ-DM-REJECT-UNMAPPED`, and
  `REQ-DM-LINEAGE`
- one generated UAT case per requirement
- non-empty case title/name, steps/procedure, and expected result
- unmapped-field negative-case semantics
- `source_digest -> derived_artifact` lineage semantics
- expected evidence ref carrying the nonce
- normal ABG result-artifact admission and result-assessment projection

## Evidence

Archive:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-26T124109700Z`

Semantic evaluation:

```json
{
  "kind": "semantic_generation_evaluation",
  "coveredRequirementIds": [
    "REQ-DM-INGEST",
    "REQ-DM-LINEAGE",
    "REQ-DM-REJECT-UNMAPPED"
  ],
  "generatedCaseCount": 3,
  "detailCharCount": 1913
}
```

Verification:

```text
CODEX_LIVE_FP=1 npm run test:live:uat
tests 2
pass 2
fail 0
duration_ms 53448.786
```

## Closure Result

The TypeScript RC live UAT lane now proves live transport/admission and one
bounded live semantic-generation obligation. It is still a UAT-quality gate, not
a broad product-quality benchmark.
