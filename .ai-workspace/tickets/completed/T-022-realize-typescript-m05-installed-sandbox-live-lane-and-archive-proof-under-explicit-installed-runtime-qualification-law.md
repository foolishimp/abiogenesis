# T-022 Realize TypeScript `M05` installed sandbox, live-lane, and archive proof under explicit installed-runtime qualification law

- id: T-022
- title: Realize TypeScript `M05` installed sandbox, live-lane, and archive proof under explicit installed-runtime qualification law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m05-installed-sandbox-wave
- change_intent: Add the TypeScript installed sandbox, live-lane, and archive-proof qualification surfaces so installed-runtime qualification, postmortem archive proof, and live scenario validation become explicit tenant-local proof law over completed `M04` delivery surfaces.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-019 completed
  - T-020 completed
  - T-021 completed
- intake_source: shared `M05` module law plus Python sandbox/install/archive proof surfaces
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/test_env/**`, installed-runtime qualification surfaces
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before installed sandbox or live-lane qualification opens, the tenant must declare one explicit installed-sandbox derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; installed runtime qualification must validate the installed line, not only source-tree imports
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/common/design/modules/M05-qualification-scenarios.yml
  - build_tenants/abiogenesis/python/test_env/test_surface_map.md
  - build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py
  - build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py
  - build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- target_truth: one explicit TypeScript installed-runtime qualification family proves install, live-lane scenarios, and archive/postmortem outputs over the installed tenant rather than only over source-only imports
- superseded_truth: the TypeScript tenant currently has no installed sandbox, archive proof, or live-lane qualification surface; Python sandbox/install/archive proof remains the only realized reference
- closure_law: this ticket closes only when the TypeScript tenant declares and lands installed sandbox, live-lane, and archive proof as explicit qualification law over installed runtime surfaces, with durable archive output and no source-only substitution for installed proof

## Migration Declaration

- old_truth_path: no TypeScript installed sandbox or archive proof exists; Python sandbox/install/archive proof remains the only realized reference
- new_truth_path: one closed TypeScript installed-runtime qualification family over installed sandbox, live-lane, and archive proof
- producers_old: Python install/archive/live-lane harnesses
- producers_new: TypeScript installed-runtime qualification harnesses
- consumers_old: Python acceptance and postmortem review
- consumers_new: TypeScript acceptance and postmortem review
- derived_surfaces:
  - installed sandbox qualification
  - live-lane scenario harness
  - run archive/postmortem output

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
  - installed-root delivery verification
  - marker-bound bootloader and instruction-file verification
  - archive-shape materialization and verification over stable run roots
- library_extension_scope:
  - none unless this wave discovers a reusable installed-line archive or
    verification pattern that crosses more than one later module boundary

## Expected Build Output

- `M05_INSTALLED_SANDBOX_DERIVATION.md`
- `M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md`
- `test_m05_sandbox_install_integration.test.mjs`
- `test_m05_sandbox_live_integration.test.mjs`
- `test_m05_run_archive_integration.test.mjs`
- `t022-m05-installed-sandbox-negative.test.mjs`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- `build_tenants/abiogenesis/python/test_env/run_archive.py`
- `build_tenants/abiogenesis/python/test_env/sandbox_runtime.py`

## Python Source Reconciliation Checklist

- [x] `python/design/GSDLC_LITE_QUALIFICATION_LADDER.md` reconciled into installed-sandbox/live-lane/archive qualification design
- [x] `python/test_env/test_surface_map.md` reconciled into TypeScript installed-runtime qualification map
- [x] `python/test_env/tests/test_run_archive.py` reconciled into TypeScript archive proof
- [x] `python/test_env/tests/test_sandbox_install.py` reconciled into TypeScript installed sandbox proof
- [x] `python/test_env/tests/test_sandbox_usecases_live.py` reconciled into TypeScript live-lane proof
- [x] `python/test_env/run_archive.py` reconciled where archive runner mechanics constrain TypeScript proof design
- [x] `python/test_env/sandbox_runtime.py` reconciled where installed sandbox harness mechanics constrain TypeScript proof design

## Functional Realization Review Checklist

- [x] installed-runtime qualification exercises the installed tenant, not only source imports
- [x] archive output is durable qualification truth rather than disposable temp output
- [x] live-lane harness preserves the same interface/provenance expectations as fake-lane proof
- [x] no installed qualification helper reconstructs runtime truth outside admitted carriers

## Impacted Interface Review Checklist

- [x] install/bootstrap and bootloader outputs are consumed through their admitted delivery surfaces
- [x] live-lane harness is tied back to module-derived qualification authority
- [x] archive proof records durable output shape and provenance
- [x] negative proof shows broken install or missing archive output fails qualification

## Required Break Order

1. derive the installed sandbox/archive surface from Python proof surfaces and completed TypeScript `M04` delivery boundaries
2. publish the installed-sandbox first-slice qualification family
3. sever source-only qualification as acceptance authority for installed proof
4. rebind install, live-lane, and archive consumers to admitted installed-runtime qualification
5. reprice later acceptance and release-facing proof surfaces

## Break Contract

- Break 1 seam severed: source-only proof standing in for installed-runtime qualification
  - expected negative proof: installed proof fails when delivery outputs are absent
- Break 2 seam severed: archive output treated as disposable and not authoritative
  - expected negative proof: missing durable archive output blocks closure

## Completion

It completes only when:

- the installed-sandbox design/module assets exist before code
- the bounded strict lane is green
- integration and negative proofs are green
- TypeScript now has installed-runtime qualification and archive proof over the installed line
- every Python source asset listed above is reconciled or explicitly marked redundant

## Completion Record

- status_at_close: completed
- reviewed_by_design_method: yes
- local_optimizations_absorbed:
  - installed-line probe imports now target the delivered bootstrap entry from
    the installed root rather than a wrong relative path under `.abiogenesis`
  - installed qualification now consumes admitted `M04` install/bootstrap and
    bootloader outcomes as authoritative upstream truth
  - redundant delivery booleans were removed from `InstalledRootObservation`
    once delivery truth moved back to the upstream outcome carriers
- cross_boundary_followups:
  - none
