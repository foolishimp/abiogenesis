# T-029 Audit TypeScript installed sandbox and live-lane proof against the Python reference tests at equivalent feature coverage

- id: T-029
- title: Audit TypeScript installed sandbox and live-lane proof against the Python reference tests at equivalent feature coverage
- type: spike
- ticket_category: implementation_migration
- migration_strategy: fundamental_re_adoption
- status: completed
- goal: typescript-tenant-m05-proof-equivalence-audit
- change_intent: Audit the completed TypeScript installed-sandbox and live-lane proof surfaces against the shipping Python sandbox reference tests so equivalence is measured at the functional/feature level rather than only by module presence, and any missed coverage becomes explicit follow-up work.
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
- completed_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before the TypeScript tenant claims sandbox equivalence against the Python ABG line, the completed TypeScript installed-sandbox and live-lane proof surfaces must be audited against the shipping Python sandbox tests at equivalent functional coverage; each Python test asset must be sourced explicitly, each Python-tested behavior must be classified as covered, intentionally repriced, redundant, or missed, and every missed still-relevant behavior must either be landed locally or opened as a linked follow-up ticket
- governing_design:
  - build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-022-realize-typescript-m05-installed-sandbox-live-lane-and-archive-proof-under-explicit-installed-runtime-qualification-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-030-realize-typescript-m05-installed-run-archive-writer-and-postmortem-finalization-proof-under-explicit-archive-finalization-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-031-realize-typescript-m05-installed-live-scenario-portfolio-parity-against-the-python-sandbox-live-reference-line.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-032-realize-typescript-m05-installed-reset-postmortem-parity-over-canonical-reset-and-continuation-law.md
- target_truth: the TypeScript installed-sandbox and live-lane proof surfaces now have one explicit feature-equivalence audit against the Python reference tests, with every Python-tested behavior classified as covered, intentionally repriced, redundant, or follow-up
- superseded_truth: `T-022` proved the TypeScript tenant has installed sandbox, live-lane, and archive proof surfaces, but parity against the Python sandbox reference tests was still inferred rather than audited
- closure_law: closed because one explicit equivalence matrix now exists, all Python source assets are checklisted, and every still-relevant missed behavior is linked to explicit follow-up tickets

## Delivered Audit Artifact

- `build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py`
- `build_tenants/abiogenesis/python/test_env/tests/run_archive.py`

## Follow-Up Result

The audit found three still-relevant parity gaps and pushed them into explicit
follow-up tickets. The current state is:

- `T-030` archive writer/finalizer parity — completed
- `T-031` installed live scenario portfolio parity — completed
- `T-032` installed reset/postmortem parity — completed

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

## Python Source Reconciliation Checklist

- [x] `python/test_env/test_surface_map.md` reconciled against the current TypeScript qualification map
- [x] `python/test_env/tests/test_sandbox_install.py` reconciled at the feature level against TypeScript installed-sandbox proof
- [x] `python/test_env/tests/test_sandbox_usecases_live.py` reconciled at the feature level against TypeScript live-lane proof
- [x] `python/test_env/tests/test_run_archive.py` reconciled at the feature level against TypeScript archive proof
- [x] `python/test_env/tests/sandbox_runtime.py` reconciled where installed harness mechanics constrain TypeScript proof design
- [x] `python/test_env/tests/run_archive.py` reconciled where durable archive mechanics constrain TypeScript proof design

## Functional Realization Review Checklist

- [x] parity claims are measured by functional/feature coverage, not by file count or module existence
- [x] the TypeScript proof line still validates the installed tenant rather than source-only imports
- [x] any repricing from Python behavior to TypeScript behavior is named explicitly and justified by current module/design law
- [x] any missed Python-tested behavior that still matters becomes a linked follow-up ticket before closure
