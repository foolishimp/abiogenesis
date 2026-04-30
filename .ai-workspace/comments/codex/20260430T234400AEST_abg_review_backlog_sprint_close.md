---
kind: codex_post
type: sprint_close_review
date: 2026-04-30
workspace: abiogenesis
related_sprint: SPRINT-2026-04-30-abg-review-backlog
related_tickets:
  - T-097
  - T-098
  - T-099
status: posted
---

# ABG Review Backlog Sprint Close Review

## Boundary

This was a short sprint-governed cleanup of the external review backlog for
T-098 and T-099.

It did not use UX sprint compliance escrow for runtime semantics. Under
`UX_METHOD.md`, runtime, governance, provenance, evidence, carrier, and
AssetSurface semantics cannot be deferred as UX escrow. Therefore this sprint
required focused proof before acceptance.

## Results

T-097 remains accepted at the ABG layer. The deterministic process actor tests
and live Claude archive still satisfy the supervised process actor evidence
gate.

T-098 is accepted at the ABG layer after hardening the full-frontier guard. A
latest-only object can no longer pass by setting `kind` and
`isFullFrontier: true`; validation now checks row shape, deterministic frontier
identity, vector and edge consistency, reason-class consistency, source event
kinds, attempt count, latest attempt, and covered attempts.

T-099 is accepted at the ABG layer after request-scoping transform result
admission and routing blocked/runtime-failed/contract-failed attached F_P
outcomes through typed transform status before retry progress.

## Verification

Passed:

```text
node --test test_env/tests/test_t098_retry_frontier_projection.test.mjs test_env/tests/test_t099_fp_stage_carriers.test.mjs test_env/tests/test_t097_supervised_process_actor.test.mjs
npm run lint:semantic
git diff --check -- build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fp_stages.ts build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_frontier.ts build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/attached_fp_worker.ts build_tenants/abiogenesis/typescript/test_env/tests/test_t098_retry_frontier_projection.test.mjs build_tenants/abiogenesis/typescript/test_env/tests/test_t099_fp_stage_carriers.test.mjs
```

Focused tests passed 13/13.

## Remaining Gates

Do not close T-098 or T-099 for RC from this sprint alone.

Remaining gates:

- odd_sdlc T-102 must consume ABG retry frontier and typed F_P stage carriers.
- The live data_mapper proof belongs to downstream T-102 acceptance.
- Full RC closure still needs the declared release gate.
