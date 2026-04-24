# T-029 Audit TypeScript installed sandbox and live-lane proof against the Python reference tests at equivalent feature coverage

- id: T-029
- title: Audit TypeScript installed sandbox and live-lane proof against the Python reference tests at equivalent feature coverage
- type: spike
- ticket_category: implementation_migration
- migration_strategy: fundamental_re_adoption
- status: backlog
- goal: typescript-tenant-m05-proof-equivalence-audit
- change_intent: Audit the completed TypeScript installed-sandbox and live-lane proof surfaces against the shipping Python sandbox reference tests so equivalence is measured at the functional/feature level rather than only by module presence, and any missed coverage becomes explicit local follow-up or triage work.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-022 completed
  - T-024 completed
- intake_source: user request on 2026-04-24 to treat translation of the Python sandbox and sandbox-live tests as an audit of TypeScript feature-level equivalence
- affected_boundary: `build_tenants/abiogenesis/typescript/test_env/**`, `build_tenants/abiogenesis/typescript/design/**`, and the completed `M05` installed qualification proof surfaces
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before the TypeScript tenant claims sandbox equivalence against the Python ABG line, the completed TypeScript installed-sandbox and live-lane proof surfaces must be audited against the shipping Python sandbox tests at equivalent functional coverage; each Python test asset must be sourced explicitly, each Python-tested behavior must be classified as covered, intentionally repriced, redundant, or missed, and every missed still-relevant behavior must either be landed locally or opened as a linked follow-up ticket
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/common/design/modules/M05-qualification-scenarios.yml
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-022-realize-typescript-m05-installed-sandbox-live-lane-and-archive-proof-under-explicit-installed-runtime-qualification-law.md
- target_truth: the TypeScript installed-sandbox and live-lane proof surfaces have one explicit feature-equivalence audit against the Python reference tests, with every Python-tested behavior either covered by current TypeScript proof, intentionally repriced, marked redundant, or turned into a follow-up ticket
- superseded_truth: `T-022` proves the TypeScript tenant has installed sandbox, live-lane, and archive proof surfaces, but it does not yet provide one explicit audit showing whether the Python sandbox reference tests are matched at equivalent functional coverage
- closure_law: this ticket closes only when the Python sandbox reference tests are audited against the TypeScript installed-sandbox and live-lane proof surfaces, one explicit equivalence matrix exists, all Python source assets are checklisted, and every missed still-relevant behavior is either absorbed locally or linked to a follow-up ticket

## Migration Declaration

- old_truth_path: TypeScript `M05` qualification exists, but proof equivalence against the Python sandbox reference tests is inferred rather than audited at the feature level
- new_truth_path: one explicit audit matrix ties each Python sandbox/live test behavior to TypeScript proof coverage, repricing, redundancy, or follow-up
- producers_old: completed `T-022`, reviewer inference, and scattered ticket source references
- producers_new: one explicit sandbox equivalence audit artifact and linked follow-up tickets where needed
- consumers_old: future TypeScript closure reviewers and parity claims
- consumers_new: future closure reviewers, forward ABG parity audits, and later qualification expansion waves
- derived_surfaces:
  - installed sandbox proof claims
  - live-lane proof claims
  - later sandbox parity claims
  - follow-up tickets for missed proof families

## Migration Checklist

- [ ] old truth path is named explicitly
- [ ] new truth path is named explicitly
- [ ] producer set for the new truth is listed
- [ ] consumer set for the new truth is listed
- [ ] projection/read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [ ] recurring realization patterns are checked against existing library/commonization surfaces
- [ ] library usage is declared and the governing library or rationale is named
- [ ] ticket wording, product wording, and proof claims are reconciled before closure

## Recurring Realization And Library Declaration

- library_usage: consume
- governing_library:
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/code/src/shared/abg_delivery_library/**`
- recurring_patterns:
  - installed-root verification
  - installed bootstrap import proof
  - installed live-lane scenario execution
  - durable archive proof over installed runtime runs
- library_extension_scope:
  - none unless the audit discovers a reusable missing proof helper or installed-runtime verification shape not yet captured by the library

## Expected Build Output

- one audit artifact mapping Python sandbox/live source assets and behaviors to TypeScript proof coverage
- one checklist showing covered, repriced, redundant, and missed Python-tested behaviors
- updates to `test_surface_map.md` if the audit changes current parity claims
- local TypeScript proof additions if one or more missed behaviors can be absorbed without widening module boundaries
- linked follow-up tickets for any still-relevant missed behavior that exceeds the local audit boundary

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py`
- `build_tenants/abiogenesis/python/test_env/run_archive.py`

## TypeScript Audit Scope

- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m05_sandbox_install_integration.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m05_sandbox_live_integration.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m05_run_archive_integration.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/t022-m05-installed-sandbox-negative.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m05-installed-fixtures.mjs`
- `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`

## Python Source Reconciliation Checklist

- [ ] `python/test_env/test_surface_map.md` reconciled against the current TypeScript qualification map
- [ ] `python/test_env/tests/test_sandbox_install.py` reconciled at the feature level against TypeScript installed-sandbox proof
- [ ] `python/test_env/tests/test_sandbox_usecases_live.py` reconciled at the feature level against TypeScript live-lane proof
- [ ] `python/test_env/tests/test_run_archive.py` reconciled at the feature level against TypeScript archive proof
- [ ] `python/test_env/tests/sandbox_runtime.py` reconciled where installed harness mechanics constrain TypeScript proof design
- [ ] `python/test_env/run_archive.py` reconciled where durable archive mechanics constrain TypeScript proof design

## Functional Realization Review Checklist

- [ ] parity claims are measured by functional/feature coverage, not by file count or module existence
- [ ] the TypeScript proof line still validates the installed tenant rather than source-only imports
- [ ] any repricing from Python behavior to TypeScript behavior is named explicitly and justified by current module/design law
- [ ] any missed Python-tested behavior that still matters becomes a local fix or linked follow-up ticket before closure

## Impacted Interface Review Checklist

- [ ] current `M05` parity claims remain honest after the audit
- [ ] `test_surface_map.md` remains aligned with the audited proof surfaces
- [ ] no new proof helper or library extension is added without being tied back to the governing library
- [ ] later ABG parity claims can cite this ticket instead of reviewer inference

## Completion

It completes only when:

- one explicit Python-to-TypeScript sandbox/live equivalence audit exists
- every Python source asset listed above is checklisted
- every still-relevant missed behavior is either landed locally or linked to a follow-up ticket
- TypeScript parity claims for installed sandbox and live-lane proof are based on audited feature coverage rather than broad equivalence language
