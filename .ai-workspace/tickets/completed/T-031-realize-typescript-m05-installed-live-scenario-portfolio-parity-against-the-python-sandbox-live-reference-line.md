# T-031 Realize TypeScript M05 installed live scenario portfolio parity against the Python sandbox live reference line

- id: T-031
- title: Realize TypeScript M05 installed live scenario portfolio parity against the Python sandbox live reference line
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m05-live-scenario-parity
- change_intent: Expand the current single bounded TypeScript installed live lane into an explicit installed scenario portfolio that matches the still-relevant Python live qualification families at equivalent feature level.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-021 completed
  - T-022 completed
  - T-029 completed
- intake_source: T-029 audit finding on 2026-04-24 that the TypeScript line proves one bounded installed live scenario but does not yet carry the Python live scenario portfolio at equivalent feature breadth
- affected_boundary: `build_tenants/abiogenesis/typescript/test_env/tests/**`, `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, and installed live-lane support
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before the TypeScript tenant claims live-lane parity against the Python sandbox line, the still-relevant Python installed live scenarios must be either carried into explicit TypeScript installed proof lanes or explicitly repriced at the same feature level with audited justification
- governing_design:
  - build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md
  - build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- source_assets:
  - build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py
  - build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py
- closure_law: this ticket closes only when the Python live scenario portfolio is explicitly reconciled into TypeScript installed proof lanes at equivalent feature coverage, or remaining repricing is made explicit and auditable

## Migration Declaration

- old_truth_path: TypeScript installed live proof covers one bounded scenario only
- new_truth_path: TypeScript installed live proof covers an explicit scenario portfolio reconciled against the Python live lane
- producers_old: `test_m05_sandbox_live_integration.test.mjs`
- producers_new: expanded installed live scenario fixtures, module-derived installed live proof lanes, and updated parity references
- consumers_old: parity reviewers relying on the one installed live scenario
- consumers_new: later sandbox/live parity claims and installed qualification closure review

## Expected Build Output

- one scenario-equivalence design addendum or first-slice extension if needed
- expanded installed live scenario proof lanes
- updated parity references in `test_surface_map.md`
- explicit checklist over the Python live scenarios

## Outcome

- design pack landed:
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_LIVE_PORTFOLIO_STRUCTURAL_CARRIER_DIAGRAM.md`
- installed live-portfolio code landed under:
  - `build_tenants/abiogenesis/typescript/code/src/qualification/m05/live_portfolio*.ts`
- installed portfolio proof now covers the five Python live scenario families
- parity references are reconciled in the TypeScript design and test surfaces

## Verification

- `npm run build:semantic`
- `npm run test:t031`
