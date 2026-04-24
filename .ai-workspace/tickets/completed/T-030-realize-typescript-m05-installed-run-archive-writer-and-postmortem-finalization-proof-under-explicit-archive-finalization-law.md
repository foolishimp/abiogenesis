# T-030 Realize TypeScript M05 installed run-archive writer and postmortem finalization proof under explicit archive finalization law

- id: T-030
- title: Realize TypeScript M05 installed run-archive writer and postmortem finalization proof under explicit archive finalization law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m05-archive-finalization-parity
- change_intent: Replace the current synthetic archive fixture-only proof with one canonical TypeScript installed run-archive writer/finalizer and executable parity proof over the Python archive reference line.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-022 completed
  - T-027 completed
  - T-028 completed
  - T-029 completed
- intake_source: T-029 audit finding on 2026-04-24 that TypeScript archive proof validates shape over a synthetic fixture but does not yet realize the Python archive writer/finalizer surface
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, `build_tenants/abiogenesis/typescript/test_env/tests/**`, and installed-line archive proof support
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before the TypeScript tenant claims archive-proof equivalence against the Python installed sandbox line, one canonical TypeScript archive writer/finalizer must materialize stable run roots and durable postmortem files, and archive qualification must validate that real output rather than a synthetic fixture only
- governing_design:
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- source_assets:
  - build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py
  - build_tenants/abiogenesis/python/test_env/tests/run_archive.py
- closure_law: this ticket closes only when one canonical TypeScript archive writer/finalizer exists, archive proof is driven from that writer rather than fixture synthesis alone, and the Python archive source assets are explicitly checklisted against the resulting TypeScript proof surface

## Migration Declaration

- old_truth_path: TypeScript archive proof validates synthetic archive fixtures only
- new_truth_path: TypeScript archive proof validates one canonical archive writer/finalizer output over the installed line
- producers_old: `materializeArchiveFixture()` plus `qualifyRunArchive(...)`
- producers_new: canonical archive writer/finalizer, archive-proof integration lane, fail-closed archive negative lane
- consumers_old: `T-022` archive qualification and reviewer inference
- consumers_new: installed qualification closure reviewers and later sandbox parity claims

## Expected Build Output

- one design pack for the archive writer/finalizer slice if existing `M05` assets are not sufficient
- one canonical TypeScript archive writer/finalizer under the installed qualification boundary
- updated archive integration proof driven from real archive output
- updated parity references in `test_surface_map.md`

## Outcome

- design pack landed:
  - `build_tenants/abiogenesis/typescript/design/M05_ARCHIVE_FINALIZATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_ARCHIVE_FINALIZATION_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M05_ARCHIVE_FINALIZATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- canonical archive-finalization code landed under:
  - `build_tenants/abiogenesis/typescript/code/src/qualification/m05/archive_finalization*.ts`
- archive integration now consumes real finalizer output before qualification
- parity references are reconciled in the TypeScript design and test surfaces

## Verification

- `npm run build:semantic`
- `npm run lint:semantic`
- `npm run test:t030`
- `npm run test:t022`
- `npm run test:semantic`
