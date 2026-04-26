# T-073 Requalify TypeScript ABG RC After Engine-Owned Iterate Repair

- id: T-073
- title: Requalify TypeScript ABG RC after engine-owned iterate repair
- type: qualification
- ticket_category: rc_requalification
- status: completed
- build_tenant: typescript
- goal: restore-abg-start-to-iterate-engine-authority-before-rc
- change_intent: Reopen and requalify the TypeScript ABG RC after T-072, because prior readiness evidence treated harness-owned iteration as sufficient proof of the internal engine.
- change_class: product_reprice
- re_entry_point: release_candidate
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
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - B-031 opened
  - T-072 completed
- blocks:
  - closing B-031
  - renewed TypeScript ABG RC readiness claim
  - downstream SDLC.TS RC dependency on ABG recursive realization
- affected_boundary: `build_tenants/abiogenesis/typescript/test_env/**`, `build_tenants/abiogenesis/typescript/package.json`, TypeScript RC live/sandbox reports, `.ai-workspace/comments/codex/**`, `.ai-workspace/tickets/completed/T-066-*`, `.ai-workspace/tickets/completed/T-071-*`
- intake_source: B-031 reopened the ABG RC claim after discovering T-066 closed on harness-local loop proof.
- target_truth: TypeScript ABG RC evidence proves engine-owned `start -> iterate` execution, reclassifies T-066 as insufficient historical proof, and publishes a renewed go/no-go decision grounded in T-072 tests and live/sandbox qualification.
- superseded_truth: Existing T-066/T-071 evidence remains sufficient for the TypeScript ABG RC and SDLC.TS PoC readiness claim.
- closure_law: This ticket closes only when the RC qualification report or replacement readiness comment explicitly reprices T-066/T-071, runs the T-072 proof lane, reruns the required semantic and live/sandbox gates, and states whether the TypeScript ABG RC is green, held, or failed.
- evaluation_criteria:
  - T-066 is marked as historical primitive/harness proof, not engine-owned iterate proof
  - T-071 readiness is amended or superseded so SDLC.TS entry does not depend on false iterate closure
  - T-072 proof lane is included in the required semantic gate
  - RC live/sandbox surfaces are rerun or explicitly held with reason
  - TypeScript test-surface map distinguishes primitive iteration tests from engine-owned iterate tests
  - renewed RC decision states impact on downstream odd_sdlc/SDLC.TS work
- proof_surface:
  - updated test-surface map
  - updated or replacement RC/readiness comment under `.ai-workspace/comments/codex/`
  - `npm run test:t072`
  - `npm run test:semantic`
  - live/sandbox RC command evidence or explicit held status
  - `npm run lint:semantic`
  - `git diff --check`
- non_closure_conditions:
  - T-066 remains the only iterate proof
  - RC decision omits the false-positive closure analysis
  - downstream SDLC.TS evidence is used to backfill ABG engine proof
  - live/sandbox failures are treated as skips without explicit RC hold status
  - the renewed readiness decision says "green" without an engine-owned `start -> iterate` proof

## Requalification Scope

This is not a broad feature ticket. It is a release/readiness correction over one
critical capability:

```text
User or agent adapter -> abg.ts.start(params) -> ABG-owned iterate runner
```

The RC can become green only after this chain is proven through the TypeScript
package surface and the older harness-owned proof is demoted.

## Closure Evidence

Completed on 2026-04-26.

## Post-STDO Correction 2026-04-26

The original T-073 RC-green record is superseded by T-074 for the F_P
assessed-result re-entry defect and B-016 proof overclaim.

Corrected focused gates now pass:

```text
npm run test:t072
tests 14
pass 14
fail 0

npm run test:t044
tests 9
pass 9
fail 0

npm run test:b016
tests 13
pass 13
fail 0

npm run test:t066
tests 1
pass 1
fail 0

npm run test:semantic
tests 239
pass 239
fail 0

npm run lint:semantic
pass

odd_sdlc npm run test:sandbox
tests 5
pass 5
fail 0

CODEX_LIVE_FP=1 npm run test:live:uat
tests 2
pass 2
fail 0
duration_ms 53448.786

CODEX_LIVE_FP=1 npm run test:live
tests 1
pass 1
fail 0
duration_ms 153622.118375

git diff --check
pass
```

B-016 is reopened. T-073 should not be cited as full B-016 closure evidence.
The next RC readiness statement must cite T-074 and rerun the selected RC gates.

Requalification surfaces:

- `.ai-workspace/comments/codex/20260426T205435Z_REQUALIFICATION_typescript_abg_rc_after_engine_iterate_repair.md`
- `docs/ABIOGENESIS_RC_NOTES.md`
- `specification/PRODUCT.md`
- `.ai-workspace/tickets/completed/T-066-prove-typescript-abg-internal-control-loop-sufficiency-start-traverse-evaluate-iterate.md`
- `.ai-workspace/tickets/completed/T-071-prove-abg-research-product-lab-readiness-for-sdlc-ts-poc-entry.md`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`

Observed verification:

```text
npm run test:t072
tests 11
pass 11
fail 0

npm run test:t072:plugins
tests 6
pass 6
fail 0

npm run test:semantic
tests 230
pass 230
fail 0

npm run test:t064
tests 3
pass 3
fail 0

CODEX_LIVE_FP=1 npm run test:live:uat
tests 1
pass 1
fail 0
duration_ms 21808.469459

CODEX_LIVE_FP=1 npm run test:live
tests 1
pass 1
fail 0
duration_ms 147970.3835

npm run lint:semantic
pass

git diff --check
pass
```

Result:

TypeScript ABG RC is green again for the current package-first RC claim.

T-066 is repriced as historical primitive/harness proof, not RC proof of an
engine-owned iterate runner. T-071 remains green only under the repaired T-072
and T-073 evidence chain. Downstream SDLC.TS PoC entry may depend on ABG as a
research product lab substrate, but it may not recreate framework-owned
iteration downstream.
