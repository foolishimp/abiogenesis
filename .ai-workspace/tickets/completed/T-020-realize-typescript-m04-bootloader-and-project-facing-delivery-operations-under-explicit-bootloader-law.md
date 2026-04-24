# T-020 Realize TypeScript `M04` bootloader and project-facing delivery operations under explicit bootloader law

- id: T-020
- title: Realize TypeScript `M04` bootloader and project-facing delivery operations under explicit bootloader law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m04-bootloader-wave
- change_intent: Add the first TypeScript bootloader and project-facing delivery boundary so bootloader documents, instruction-file injection, and project-facing runtime operations are owned by explicit delivery carriers rather than by implicit installer script behavior.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-015 completed
  - T-019 completed
  - T-028 completed
- intake_source: shared `M04` bootloader surface and Python `gen-install.py` / GTL bootloader reference
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, project-facing delivery surfaces, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before bootloader code opens, the tenant must declare one explicit bootloader derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; bootloader output remains delivery truth and cannot restate or mutate kernel semantics
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
  - build_tenants/abiogenesis/python/code/gen-install.py
  - build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- target_truth: one explicit TypeScript bootloader/project-facing delivery family materializes bootloader and instruction-file delivery as admitted delivery carriers and keeps those surfaces below constitutional and kernel truth
- superseded_truth: the TypeScript tenant currently has no bootloader delivery surface; Python installer and GTL bootloader injection remain the only realized reference
- closure_law: this ticket closes only when bootloader/project-facing delivery is declared and landed as one admitted delivery family with explicit output and verification, and no instruction-file mutation or bootloader write remains helper-owned implicit authority

## Migration Declaration

- old_truth_path: no TypeScript bootloader delivery exists; Python installer/bootloader injection is the only realized reference
- new_truth_path: one closed TypeScript bootloader/project-facing delivery family
- producers_old: Python installer/bootloader helpers
- producers_new: TypeScript bootloader delivery constructors and effect shells
- consumers_old: Python installed runtime and project-facing bootstrap surfaces
- consumers_new: TypeScript installed runtime and later sandbox/install qualification
- derived_surfaces:
  - bootloader document output
  - instruction-file injection
  - project-facing delivery verification

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
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/code/src/shared/abg_delivery_library/**`
- recurring_patterns:
  - bootloader document shaping
  - instruction-file injection markers and idempotence
  - project-facing delivery verification fixtures
- library_extension_scope:
  - none until `T-028` closes; later reusable delivery extensions require
    explicit design review before code

## Expected Build Output

- `M04_BOOTLOADER_DERIVATION.md`
- `M04_BOOTLOADER_FIRST_SLICE_IACS.md`
- `M04_BOOTLOADER_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded bootloader/project-facing delivery slice
- `test_m04_bootloader_unit.test.mjs`
- `test_m04_bootloader_integration.test.mjs`
- `t020-m04-bootloader-negative.test.mjs`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/code/gen-install.py`
- `build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md`
- `build_tenants/abiogenesis/python/code/gtl_spec/packages/project_package.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`

## Python Source Reconciliation Checklist

- [x] `python/code/gen-install.py` reconciled for bootloader/instruction-file delivery mechanics
- [x] `python/code/gtl_spec/GTL_BOOTLOADER.md` reconciled into TypeScript bootloader delivery truth
- [x] `python/code/gtl_spec/packages/project_package.py` reconciled where project-facing bootloader obligations constrain delivery
- [x] `python/test_env/tests/test_sandbox_install.py` reconciled into TypeScript bootloader/install proof

## Functional Realization Review Checklist

- [x] bootloader remains delivery truth and does not restate constitutional or kernel semantics
- [x] instruction-file mutation is explicit, idempotent, and carrier-owned
- [x] no helper-owned silent bootloader injection remains authoritative
- [x] later install/sandbox proof can consume the bootloader boundary without inventing new delivery law

## Impacted Interface Review Checklist

- [x] bootloader output builders consume admitted delivery carriers only
- [x] project-facing instruction-file injection is explicit and verifiable
- [x] negative proof rejects missing or mismatched bootloader source/output

## Required Break Order

1. derive the bootloader surface from Python reference and shared `M04` law
2. publish the bootloader first-slice delivery family
3. sever helper-owned implicit instruction-file mutation as authority
4. rebind bootloader output and verification to admitted delivery carriers
5. reprice install and sandbox consumers

## Break Contract

- Break 1 seam severed: implicit helper-owned bootloader injection
  - expected negative proof: missing bootloader source/output fails closed
- Break 2 seam severed: bootloader output restates kernel or constitutional meaning
  - expected negative proof: bootloader delivery remains verification-only over upstream truth

## Completion

It completes only when:

- the bootloader design/module assets exist before code
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- bootloader/project-facing operations remain explicit delivery law below kernel semantics
- every Python source asset listed above is reconciled or explicitly marked redundant

## Completion Record

- status: completed
- completed_at: 2026-04-24
- design_method_review: pass with no residual closure blockers
- verification:
  - `npm run build:semantic`
  - `npm run lint:semantic`
  - `npm run test:t020`
  - `npm run test:semantic`
  - `git diff --check`
- delivered_artifacts:
  - `build_tenants/abiogenesis/typescript/design/M04_BOOTLOADER_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M04_BOOTLOADER_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M04_BOOTLOADER_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/code/src/app/m04/bootloader/**`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_bootloader_unit.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_bootloader_integration.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/t020-m04-bootloader-negative.test.mjs`
