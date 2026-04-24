# T-028 Realize a tenant-local ABG common delivery library for installed-root plans, verification, and instruction-file injection

- id: T-028
- title: Realize a tenant-local ABG common delivery library for installed-root plans, verification, and instruction-file injection
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-common-delivery-library-wave
- change_intent: Extract the repeated delivery-boundary mechanics now visible across `T-019` install/bootstrap and the upcoming `T-020` bootloader wave into one tenant-local common delivery library so installed-root plans, file refs, verification, and instruction-file injection are not rebuilt locally per ticket.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-015 completed
  - T-019 completed
- intake_source: post-ticket recurrence/commonization review on `T-019` plus the active `T-020` bootloader design opening
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/shared/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: extend
- governing_library: none yet; this ticket creates the first tenant-local common delivery library
- authoritative_contract: before new delivery-boundary code reuses ad hoc install or instruction-file helpers again, the tenant must declare one explicit common delivery-library derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; the library remains delivery-only and cannot restate kernel or constitutional truth
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- target_truth: one explicit tenant-local ABG common delivery library owns reusable installed-root plan carriers, delivery artifact refs, delivery verification helpers, and instruction-file injection helpers while leaving product, runtime, and bootloader meaning in the owning module tickets
- superseded_truth: delivery-boundary mechanics currently live only inside `T-019` install/bootstrap code and would otherwise be rebuilt again in `T-020`
- closure_law: this ticket closes only when one explicit common delivery library is declared, landed, and proven, `T-019` consumes it for the already landed install/bootstrap boundary, and later delivery tickets can consume it without rebuilding the same realization substrate again

## Migration Declaration

- old_truth_path: delivery-plan, writer, verification, and file-injection mechanics are local to `T-019` install/bootstrap and would otherwise reappear ad hoc in later delivery waves
- new_truth_path: one tenant-local common delivery library below module semantics and above ticket-local delivery effect shells
- producers_old: local `T-019` install/bootstrap helpers
- producers_new: shared delivery library constructors and helpers
- consumers_old: only `T-019` install/bootstrap
- consumers_new: `T-019` install/bootstrap immediately, `T-020` bootloader next, and later installed sandbox/archive waves if lawful
- derived_surfaces:
  - installed-root plan carriers
  - delivery artifact refs
  - delivery verification helpers
  - instruction-file injection helpers

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

- library_usage: extend
- governing_library: none yet; this ticket creates the first common delivery library
- recurring_patterns:
  - installed directory/file refs
  - pure delivery plans
  - delivery materialization/verification helpers
  - instruction-file marker injection and idempotence
- extension_scope:
  - reusable delivery-boundary mechanics only
  - no runtime semantic carriers
  - no bootloader content doctrine

## Expected Build Output

- `ABG_COMMON_DELIVERY_LIBRARY_DERIVATION.md`
- `ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- `ABG_COMMON_DELIVERY_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded `code/src/shared/abg_delivery_library/**` slice
- refit of `code/src/app/m04/install_bootstrap/**` onto the library
- `test_abg_common_delivery_library_unit.test.mjs`
- `test_abg_common_delivery_library_integration.test.mjs`
- `t028-abg-common-delivery-library-negative.test.mjs`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/code/gen-install.py`
- `build_tenants/abiogenesis/python/code/genesis/install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md`

## Python Source Reconciliation Checklist

- [x] `python/code/gen-install.py` reconciled for reusable delivery mechanics rather than Python-specific script doctrine
- [x] `python/code/genesis/install.py` reconciled where workspace bootstrap mechanics constrain delivery helpers
- [x] `python/test_env/tests/test_sandbox_install.py` reconciled where installed-root verification constrains reusable proof helpers
- [x] `python/code/gtl_spec/GTL_BOOTLOADER.md` reconciled only where instruction-file delivery mechanics become reusable helper law

## Functional Realization Review Checklist

- [x] the library remains delivery-only and does not restate kernel or constitutional meaning
- [x] delivery helpers are reusable without becoming a rival public product boundary
- [x] `T-019` consumes the library instead of preserving duplicated local delivery substrate
- [x] later delivery tickets can consume the library without changing owned module truth

## Impacted Interface Review Checklist

- [x] shared delivery helpers consume admitted delivery carriers only
- [x] instruction-file injection is explicit, idempotent, and verifiable
- [x] negative proof shows mismatched marker contracts or delivery plans fail closed

## Completion

It completes only when:

- the common delivery-library design/module assets exist before shared code
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- `T-019` consumes the shared delivery library
- no repeated delivery-boundary helper remains locally authoritative in `T-019`

## Completion Record

- design/module assets landed:
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
- code boundary landed:
  - `build_tenants/abiogenesis/typescript/code/src/shared/abg_delivery_library/**`
- consuming refit landed:
  - `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/**`
- proof lanes landed:
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_abg_common_delivery_library_unit.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_abg_common_delivery_library_integration.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/t028-abg-common-delivery-library-negative.test.mjs`
- verification:
  - `npm run build:semantic`
  - `npm run lint:semantic`
  - `npm run test:t028`
  - `npm run test:t019`
  - `npm run test:semantic`
  - `git diff --check`
