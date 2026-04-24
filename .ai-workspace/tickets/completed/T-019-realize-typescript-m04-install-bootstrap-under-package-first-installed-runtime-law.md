# T-019 Realize TypeScript `M04` install/bootstrap under package-first installed runtime law

- id: T-019
- title: Realize TypeScript `M04` install/bootstrap under package-first installed runtime law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m04-install-bootstrap-wave
- change_intent: Add the first TypeScript install/bootstrap delivery boundary so installed runtime assets, package metadata, and workspace bootstrap are materialized as explicit delivery truth below kernel semantics rather than as ad hoc file-copy scripts.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-015 completed
  - T-018 completed
- intake_source: shared `M04` install-bootstrap surface, Python `gen-install.py`, and Python sandbox/install proof lanes
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, install packaging surfaces, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: none
- library_rationale: the current ABG common realization library owns reusable expectation, contract/policy, and proof-helper patterns for runtime/app carrier boundaries only; the first install/bootstrap wave is a delivery boundary with no existing library slice for installed-root or package-bootstrap carriers
- authoritative_contract: before install/bootstrap code opens, the tenant must declare one explicit install/bootstrap derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; install/bootstrap may materialize delivery artifacts, but it must remain below kernel semantics and must not silently replace runtime/package identity truth
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
  - build_tenants/abiogenesis/python/code/gen-install.py
  - build_tenants/abiogenesis/python/test_env/test_surface_map.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- target_truth: one explicit TypeScript install/bootstrap family materializes installed runtime delivery truth and package/bootstrap artifacts while preserving kernel-owned semantic law and explicit runtime identity inputs
- superseded_truth: the TypeScript tenant currently has no installed-runtime/bootstrap surface; Python `gen-install.py` and sandbox-install proof remain the only realized reference
- closure_law: this ticket closes only when the TypeScript tenant declares and lands one package-first installed-runtime/bootstrap boundary with explicit delivery carriers, keeps kernel semantics below that surface, and proves installation/verification through module-derived proof rather than ad hoc script success alone

## Migration Declaration

- old_truth_path: no TypeScript install/bootstrap exists; Python `gen-install.py` remains the only realized delivery reference
- new_truth_path: one closed TypeScript install/bootstrap delivery family over package-first installed runtime law
- producers_old: Python installer/bootstrap script
- producers_new: TypeScript install/bootstrap delivery constructors and effect shells
- consumers_old: Python installed runtime and sandbox qualification lanes
- consumers_new: TypeScript installed runtime, later bootloader, and later sandbox qualification lanes
- derived_surfaces:
  - installed runtime root
  - package/bootstrap verification
  - later bootloader delivery
  - later sandbox install proof

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

- library_usage: none
- library_rationale:
  - the current tenant-local ABG common realization library is scoped to
    expectation derivation, subordinate contract/policy carriers, and
    module-derived proof helpers for runtime/app carrier boundaries
  - the first install/bootstrap slice is a delivery boundary over installed
    roots and package/bootstrap verification and therefore does not yet consume
    a reusable common library surface
- recurring_patterns:
  - package manifest shaping
  - installed-root delivery shaping
  - module-derived install/bootstrap proof fixtures
- commonization_rule:
  - if repeated delivery-carrier or install-proof patterns appear in more than
    one later ticket, create or extend a dedicated delivery library under the
    recurrence-extraction rule rather than rebuilding them a third time

## Expected Build Output

- `M04_INSTALL_BOOTSTRAP_DERIVATION.md`
- `M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md`
- `M04_INSTALL_BOOTSTRAP_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded install/bootstrap slice under `code/src/app/m04/**` or equivalent delivery surface
- `test_m04_install_bootstrap_unit.test.mjs`
- `test_m04_install_bootstrap_integration.test.mjs`
- `t019-m04-install-bootstrap-negative.test.mjs`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/code/gen-install.py`
- `build_tenants/abiogenesis/python/code/genesis/install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`

## Python Source Reconciliation Checklist

- [x] `python/design/ABG_3_MODULE_DESIGN.md` reconciled for install/bootstrap ownership below kernel semantics
- [x] `python/code/gen-install.py` reconciled into TypeScript install/bootstrap delivery law
- [x] `python/code/genesis/install.py` reconciled where engine-owned install/runtime behavior constrains the app boundary
- [x] `python/test_env/tests/test_sandbox_install.py` reconciled into TypeScript install/bootstrap proof lanes
- [x] `python/test_env/tests/test_run_archive.py` reconciled where archive/install obligations constrain delivery proof

## Functional Realization Review Checklist

- [x] install/bootstrap remains a delivery boundary below kernel semantics
- [x] runtime/package identity is explicit rather than helper-owned fallback
- [x] installed output shape is derived from declared delivery carriers rather than open file-copy scripts alone
- [x] later sandbox/install proof can consume this boundary without invention

## Impacted Interface Review Checklist

- [x] installed runtime builder consumes admitted install/bootstrap carriers only
- [x] no install helper reconstructs kernel law or runtime meaning
- [x] negative proof rejects incomplete or mismatched installed delivery roots

## Required Break Order

1. derive the install/bootstrap surface from Python reference and shared `M04` law
2. publish the install/bootstrap first-slice delivery family
3. sever ad hoc script-owned delivery truth as authority
4. rebind installed runtime materialization to admitted delivery carriers
5. reprice later bootloader and sandbox consumers

## Break Contract

- Break 1 seam severed: script-owned delivery truth without admitted install/bootstrap carriers
  - expected negative proof: incomplete install output fails closed
- Break 2 seam severed: install/bootstrap silently replaces runtime/package identity truth
  - expected negative proof: mismatched identity input is rejected rather than normalized

## Completion

It completes only when:

- the install/bootstrap design/module assets exist before code
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- the installed runtime surface is explicit delivery law below kernel semantics
- every Python source asset listed above is reconciled or explicitly marked redundant

## Completion Record

- design/module assets landed:
  - `build_tenants/abiogenesis/typescript/design/M04_INSTALL_BOOTSTRAP_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M04_INSTALL_BOOTSTRAP_STRUCTURAL_CARRIER_DIAGRAM.md`
- code boundary landed:
  - `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/**`
- proof lanes landed:
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_install_bootstrap_unit.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_install_bootstrap_integration.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/t019-m04-install-bootstrap-negative.test.mjs`
- verification:
  - `npm run build:semantic`
  - `npm run lint:semantic`
  - `npm run test:t019`
- post-ticket design review:
  - no remaining local closure defects
  - no new cross-boundary commonization ticket was required because this is the
    first bounded delivery-boundary realization of this shape
