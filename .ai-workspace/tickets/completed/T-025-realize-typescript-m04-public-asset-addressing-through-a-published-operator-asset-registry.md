# T-025 Realize TypeScript `M04` public asset addressing through a published operator asset registry

- id: T-025
- title: Realize TypeScript `M04` public asset addressing through a published operator asset registry
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m04-public-asset-addressing-wave
- change_intent: Add the TypeScript `M04` public asset-addressing surface so app-facing targeting can address published operator assets through one explicit registry and ownership boundary instead of implicit helper lookup or open string routing.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-015 completed
  - T-024 completed
- intake_source: `T-024` audit found the Python operator asset registry source line is not yet explicitly carried or repriced in the TypeScript backlog
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/code/src/gtl/m02/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before public asset-addressing code opens, the tenant must declare one explicit derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; public asset targeting must consume published operator-asset truth through one explicit registry boundary rather than helper-owned string interpretation
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
  - build_tenants/abiogenesis/python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md
  - build_tenants/abiogenesis/python/code/genesis/binding.py
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- constitutional_requirements:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-015-front-run-the-remaining-typescript-tenant-design-and-module-derivation-from-the-released-python-reference.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md
- target_truth: TypeScript `M04` has one explicit public asset-addressing boundary over published operator-asset registry truth so callers can target published assets without helper-owned lookup drift or open string bags
- superseded_truth: the current TypeScript tenant has no explicit public asset-addressing or operator asset registry wave even though the Python reference line has an operator asset ownership surface
- closure_law: this ticket closes only when the public asset-addressing boundary is declared, landed, and proven as one explicit registry-and-targeting family that preserves published ownership truth, fails closed on unknown or ambiguous asset targets, and does not widen unrelated GTL or runtime carriers just to route assets

## Migration Declaration

- old_truth_path: public asset-addressing is absent in TypeScript and only implicit in Python operator asset ownership surfaces
- new_truth_path: one explicit TypeScript public asset-addressing family over a published operator-asset registry boundary
- producers_old: Python operator asset registry design and runtime binding helpers
- producers_new: TypeScript registry admission, targeting carriers, and public route binding
- consumers_old: Python delivery and app-facing targeting flows
- consumers_new: TypeScript app-facing delivery, later bootloader, and later qualification surfaces
- derived_surfaces:
  - public asset-targeting package surface
  - later event-ingress and bootloader routing
  - later qualification scenarios that target operator assets

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] library usage is declared and the governing library or rationale is named
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Recurring Realization And Library Declaration

- library_usage: consume
- governing_library:
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/**`
- recurring_patterns:
  - explicit subordinate contract carrier admission
  - fail-closed ownership projection
  - module-derived proof helper profiles
- library_extension_scope:
  - none unless this wave discovers a reusable registry/ownership pattern that
    crosses more than one later module boundary

## Expected Build Output

- `M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md`
- `M04_PUBLIC_ASSET_ADDRESSING_FIRST_SLICE_IACS.md`
- `M04_PUBLIC_ASSET_ADDRESSING_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded `code/src/app/m04/asset_addressing/**` slice or equivalent module-owned surface
- `test_m04_public_asset_addressing_unit.test.mjs`
- `test_m04_public_asset_addressing_integration.test.mjs`
- `t025-m04-public-asset-addressing-negative.test.mjs`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`
- `build_tenants/abiogenesis/python/code/genesis/binding.py`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`

## Python Source Reconciliation Checklist

- [x] `python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md` reconciled for registry ownership, published asset identity, and fail-closed target semantics
- [x] `python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md` reconciled for public-facing targeting semantics
- [x] `python/code/genesis/binding.py` reconciled for runtime-facing asset binding without helper-owned drift
- [x] `python/test_env/test_surface_map.md` reconciled into future TypeScript module-derived proof lanes

## Functional Realization Review Checklist

- [x] public asset-addressing remains a closed public boundary rather than open string routing
- [x] published operator asset truth has one owner
- [x] app/bootstrap helpers do not reconstruct registry meaning procedurally
- [x] unknown or ambiguous asset targets fail closed
- [x] local cleanup is absorbed only inside the owning wave; cross-boundary opportunities create triage tickets

## Impacted Interface Review Checklist

- [x] no rival public asset-targeting path exists beside the declared registry boundary
- [x] package-facing targeting stays above GTL publication truth rather than repricing it
- [x] negative proof rejects unknown, ambiguous, or malformed asset targets

## Completion

It completes only when:

- the public asset-addressing design/module assets exist before code
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- unknown and ambiguous asset targets fail closed
- every Python source asset listed above is reconciled or explicitly marked redundant

## Completion Record

- status: completed
- completed_at: 2026-04-24
- design_method_review: pass with no residual closure blockers
- verification:
  - `npm run build:semantic`
  - `npm run lint:semantic`
  - `npm run test:t025`
  - `npm run test:semantic`
  - `git diff --check`
- delivered_artifacts:
  - `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_ASSET_ADDRESSING_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_ASSET_ADDRESSING_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/code/src/app/m04/asset_addressing/**`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_public_asset_addressing_unit.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_public_asset_addressing_integration.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/t025-m04-public-asset-addressing-negative.test.mjs`
