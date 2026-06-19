# ODD SDLC TypeScript Decommission Register

**Status**: Active design register for T-171
**Date**: 2026-05-17
**Owner Ticket**:
`.ai-workspace/tickets/active/T-171-full-test35-parity-refactor-for-test72-execution-backed-closure.md`
**Derives From**: `specification/PRODUCT.md`,
`specification/requirements/13-odd-sdlc-typescript-tenant.md`,
`specification/requirements/16-edge-gain-closure-contract.md`,
`ODD_SDLC_TYPESCRIPT_EDGE_GAIN_CLOSURE_CONTRACT.md`,
`ODD_SDLC_TYPESCRIPT_TEST_PIPELINE.md`,
`.ai-workspace/comments/codex/20260517T121500Z_T171_decommission_map.md`

## Purpose

This register is the design-owned retain/derive/replace/delete map for
TypeScript surfaces touched by the T-171 test35-parity refactor.

A touched surface not listed here is not accepted as closed by T-171. A retained
surface must serve current product truth. A derived surface must name its
upstream authority. A replaced or deleted surface must not remain as active
compatibility behavior.

## Disposition Terms

- `retain`: the surface directly serves current test35-parity product truth.
- `derive`: the surface remains only as a projection from a named authority.
- `replace`: the old authority path is removed from active truth and the named
  replacement owns the behavior.
- `delete`: the surface has no current product purpose and is removed.

## Register

| Surface | Original Path | Disposition | Replacement / Surviving Authority | Proof |
| --- | --- | --- | --- | --- |
| Conformance-authored product/spec authority | `code/src/workspace/project_profile.ts` | replace | `Fg_conform_project` writes only bootstrap/context read models and tenant registry; graph traversal writes product/spec surfaces. | T-068, T-087, T-096 |
| Synthetic lineage through `00-imported-sources.md` | former `code/src/operator/handoff.ts`; current product-materialization and transform result modules | replace | Product materialization lineage comes from loaded workspace authority or graph-owned requirement surfaces; imported-sources is provenance only. | T-066, T-088, T-091, T-143 |
| Workspace graph outputs archived only under runtime assets | former `code/src/operator/handoff.ts`; current consequence edge projection and file-store effect | replace | Workspace-local graph outputs write to `specification/` and scenario paths through declared edge-output projection, not runtime archive-only helpers. | T-068, T-184 |
| Missing graph-output materialization ledger refs | `code/src/operator/installed_operator.ts` | replace | Edge fulfillment ledgers record the selected worker output file plus product materialized files. | T-064 |
| Missing UAT/testcase graph products | `code/src/graph/catalog.ts`, `code/src/operator/test_pipeline.ts` | replace | `derive_uat_testcases_surface` and `derive_testcase_authority_surface` are explicit graph products before design/test construction. | T-030, T-168 |
| Target-carrier template as content closure | `code/src/graph/target_carrier_contracts.ts`, `code/src/operator/plugins/transform/launch_contract.ts`, `code/src/operator/prompt_assets.ts` | retain with corrected placement | Target carrier templates constrain F_P output shape and disambiguation; they do not close product content. | T-171 closure-law tests |
| Multiple prompt-authority packages | former `code/src/operator/handoff.ts`; current `code/src/operator/prompt_assets.ts`, `code/src/operator/plugins/transform/launch_contract.ts`, `code/src/operator/carriers.ts` | derive | GTL `AssetSurface` and `worker_construction_brief.json` are the prompt source surfaces; handoff manifest, invocation package, traversal intent, worker brief, and gap dossier are derived or forensic. | T-118, T-161, T-191 |
| Worker-controlled traversal recursion | former `code/src/operator/handoff.ts`; current worker transport and launch contract modules | replace | Worker control boundary forbids workers from invoking `odd-sdlc-ts`, ABG commands, traversal, install, resume, or nested workers. | T-118 |
| Shape/conformance-only close | `code/src/operator/edge_gain_closure.ts`, `code/src/operator/traversal_consequence.ts`, `code/src/operator/installed_operator.ts` | replace | Close-capable product edges require F_P fulfillment; execution-required edges require admitted execution-result evidence; residual pressure remains close-blocking. | T-164, T-171 |
| Analyzer aliases hiding missing stages | `code/src/analysis/*` | replace | Analyzer reports constructive/projection/rollup/missing/unmapped stages plus prompt, timing, pressure, and execution-evidence source. | T-161 |
| Harness push-along as proof authority | `test_env/sandbox/*`, `test_env/live/*` | retain as setup only | Harness may launch and archive runs; closure proof comes from runtime archives, worker reports, ledgers, closure decisions, and analyzer output. | T-171 live proof gate |
| Bootstrap expansion as product authority | `test_env/fixtures/*/bootstrap.md`, `code/src/workspace/project_profile.ts` | replace | Bootstrap remains compact input/context; graph traversal owns product/spec construction. | T-087, T-096 |
| Component-code smoke execution as lifecycle proof | `test_env/sandbox/scenarios/t132_hello_world_js.scenario.mjs`, current transform launch/result modules, `code/src/operator/installed_operator.ts` | replace | Full lifecycle proof requires graph-generated component tests and `derive_test_execution_result_surface` graph-owned execution evidence; component-code smoke may not substitute for release closure. | T-171 lifecycle runner gate, T-184 reduced-overlay proof |

## Close-Time Audit Rule

Before T-171 closes, the ticket must cite this register and a current grep/test
audit showing that every touched surface is either retained for a named current
purpose, derived from one authority, replaced by the named surface, or deleted.
