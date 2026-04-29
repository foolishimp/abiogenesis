---
id: T-083
title: Preserve runtime event log on TypeScript installer refresh
type: bug
ticket_category: rc_blocker
status: completed
goal: abg-typescript-installer-refresh-idempotence
change_intent: Reinstalling or refreshing the TypeScript installer into an existing governed workspace must not erase `.ai-workspace/events/events.jsonl`. The odd_sdlc data_mapper.test46.ts live run proved the current refresh path resets traversal evidence and restarts the graph from vector 0.
change_class: realization_refactor
re_entry_point: code
affected_boundary: TypeScript installer bootstrap plan, imported-workspace refresh mode, event log preservation, downstream sandbox/live-run proof
priority: high
triaged_at: 2026-04-27T10:21:15Z
created_at: 2026-04-27T10:21:15Z
updated_at: 2026-04-27T10:43:00Z
dependencies:
  - T-076 completed
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
intake_source: odd_sdlc `data_mapper.test46.ts` installed refresh during T-041 live RC qualification on 2026-04-27.
target_truth: installer refresh is idempotent over existing runtime evidence; it creates missing event/runtime paths but never truncates existing event logs unless an explicit clean policy authorizes destruction.
superseded_truth: installer refresh can safely rewrite `.ai-workspace/events/events.jsonl` to an empty file in imported workspaces.
closure_law: this ticket closes when TypeScript installer tests prove refresh preserves existing event log content and downstream odd_sdlc live refresh no longer resets graph progress.
evaluation_criteria:
  - initial install still creates `.ai-workspace/events/events.jsonl` when absent
  - refresh install preserves non-empty existing `.ai-workspace/events/events.jsonl`
  - clean/scaffold policies, if any, declare explicit destructive authority before event truncation
  - install provenance records whether event log was created or preserved
  - downstream odd_sdlc refresh can update package code without losing graph projection state
proof_surface:
  - TypeScript installer unit/integration test
  - downstream odd_sdlc refresh proof or archive note
  - updated installer design/provenance rule if missing
non_closure_conditions:
  - event log is restored only manually after refresh
  - preservation is limited to odd_sdlc-specific installer code instead of ABG install law
  - refresh behavior depends on package manager cache state
---

## Live Evidence

Workspace:

- `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test46.ts`

Before refresh, the odd_sdlc live run had advanced through vector 14.
Refreshing the installed package to pick up a source fix called the ABG
installer in imported refresh mode. The next `odd-sdlc-ts start` archive was:

- `.ai-workspace/runtime/odd_sdlc/operator-runs/20260427T102441340Z_pid16089`

It reported:

- `replayEventCountBefore: 0`
- `replayEventCountAfter: 5`
- current edge after run: `derive_product_surface`

`wc -l .ai-workspace/events/events.jsonl` returned `5`, proving the prior
runtime event chain had been erased.

## Closure Evidence

Source fix:

- `build_tenants/abiogenesis/typescript/code/src/shared/abg_delivery_library/carriers.ts`
  adds `writeMode?: "overwrite" | "create_if_missing"` to delivery file refs.
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_delivery_library/materialization.ts`
  preserves existing files whose write mode is `create_if_missing`.
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_delivery_library/constructors.ts`
  preserves `writeMode`.
- `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/install.ts`
  marks `.ai-workspace/events/events.jsonl` as `create_if_missing`.
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_install_bootstrap_integration.test.mjs`
  proves reinstall preserves an existing event log.

Verification:

- `npm run test:t019` passed: 9 tests.

Downstream proof:

- Before refresh, `data_mapper.test46.ts/.ai-workspace/events/events.jsonl`
  had 90 lines.
- After refreshing odd_sdlc.TS with the patched ABG installer, it still had
  90 lines.
- `odd-sdlc-ts gaps --workspace .` still reported converged with closed
  vectors `0..17`.
