# Proof: Live Semantic Generation UAT

## Claim

The TypeScript RC live UAT lane now tests live semantic generation, not only
transport and result-artifact admission.

## What Changed

`test_m05_rc_live_uat.test.mjs` now runs two live tests:

1. the original contract-shaped transport/admission lane
2. a nonce-bound semantic-generation lane

The new lane gives the F_P worker fresh `data_mapper` source requirements and a
nonce. The worker must synthesize UAT content inside `fulfillment_detail`.

The deterministic evaluator then checks:

- nonce preservation
- exact requirement coverage
- one generated UAT case per source requirement
- non-empty case title/name, steps/procedure, and expected result
- unmapped-field negative-case semantics
- `source_digest -> derived_artifact` lineage semantics
- expected nonce-bearing evidence ref
- normal ABG result assessment to `assessed` truth

## Live Evidence

Archive:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-26T124109700Z`

Semantic evaluation:

```json
{
  "kind": "semantic_generation_evaluation",
  "nonce": "semantic-be0c7121-f912-4baa-994d-7c7863e6293a",
  "coveredRequirementIds": [
    "REQ-DM-INGEST",
    "REQ-DM-LINEAGE",
    "REQ-DM-REJECT-UNMAPPED"
  ],
  "generatedCaseCount": 3,
  "detailCharCount": 1913,
  "evidenceRefs": [
    "live://typescript-rc-uat-semantic/semantic-be0c7121-f912-4baa-994d-7c7863e6293a"
  ]
}
```

Command:

```text
CODEX_LIVE_FP=1 npm run test:live:uat
tests 2
pass 2
fail 0
duration_ms 53448.786
```

## Interpretation

The previous live UAT lane was valid live transport proof but weak semantic
generation proof because the prompt supplied almost the whole artifact.

The new lane is a bounded live semantic-generation proof. It still uses the
normal ABG artifact contract, but the quality-bearing content is derived from
source requirements and deterministically checked before result assessment.
