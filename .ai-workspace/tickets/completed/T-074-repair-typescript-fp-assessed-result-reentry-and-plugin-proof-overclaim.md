# T-074 Repair TypeScript F_P Assessed Result Re-Entry And Plugin Proof Overclaim

- id: T-074
- title: Repair TypeScript F_P assessed result re-entry and plugin proof overclaim
- type: bug
- ticket_category: rc_corrective
- status: completed
- build_tenant: typescript
- goal: restore-abg-start-to-iterate-engine-authority-before-rc
- change_intent: Correct STDO feedback showing that replayed F_P `assessed` truth did not advance the engine runner and that B-016/T-072 plugin inventory wording overclaimed runtime migration.
- change_class: realization_refactor
- re_entry_point: typescript_m03_m04_runtime_projection
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: critical
- created_at: 2026-04-26
- activated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-072
  - T-073
  - B-016 reopened
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts`, `build_tenants/abiogenesis/typescript/test_env/tests/**`, TypeScript M03/M04 design/test-surface docs, B-016 governance state
- intake_source: `.ai-workspace/comments/codex/20260426T114125Z_REVIEW_t071_t073_abg_ts_readiness_under_stdo.md`
- target_truth: Replayed F_P assessed-result truth closes exactly one matching graph vector, advances re-entry to the next vector without redispatching the assessed edge, emits dispatch truth before the F_P effect edge is invoked, and distinguishes runner-consumed plugin seams from classified-only hook families.
- superseded_truth: `assessed` events can be recorded as visibility only while the runner redispatches the same F_P edge; plugin inventory classification is sufficient to close B-016.

## Evaluation Criteria

- `deriveRuntimeAggregateProjection(...)` treats admitted `assessed` runtime
  events as replay closure for exactly one matching graph vector.
- duplicate assessed obligations for the same edge are idempotent.
- assessed edges outside the graph fail closed.
- out-of-order assessed closure fails closed.
- M04 `start(...)` re-entry with prior assessed truth advances to the next
  vector and does not call the F_P dispatch plugin for the already assessed
  edge.
- the F_P dispatch plugin is invoked only after `fp_dispatch_requested` truth is
  emitted.
- `enginePluginInventory()` distinguishes `runner_consumed` from
  `classified_hook_family`.
- B-016 is reopened because classified-only hook rows are not runtime migration
  proof.
- the ODD SDLC emergent outcome-iteration sandbox remains green.

## Realization

- `RuntimeAggregateProjection` now derives vector closure from assessed-result
  truth by matching the assessed edge to graph vector truth.
- `closeVectorFromReplay(...)` commonizes closure order and duplicate checks for
  both `vector_closed` and `assessed` replay sources.
- `runEngineIterate(...)` emits `fp_dispatch_requested` before invoking the F_P
  dispatch plugin.
- `EnginePluginInventoryEntry` now carries `runtimeBindingStatus` and
  `proofScope`.
- B-016 moved back to backlog with the TypeScript runner slice recorded as a
  partial proof, not full closure.

## Proof

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

odd_sdlc B-068/B-069 focused sandbox
tests 4
pass 4
fail 0

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

## Closure Result

The T-072 runner slice is corrected for F_P assessed-result re-entry.

B-016 is not closed. The current TypeScript proof only covers runner-consumed
seams and classification of broader hook families.
