# T-032 Realize TypeScript M05 installed reset postmortem parity over canonical reset and continuation law

- id: T-032
- title: Realize TypeScript M05 installed reset postmortem parity over canonical reset and continuation law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m05-installed-reset-postmortem-parity
- change_intent: Add installed-line proof that reset on the TypeScript line drives the same still-relevant postmortem truths the Python sandbox line proves for superseded runs and abandoned continuations.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-013 completed
  - T-016 completed
  - T-018 completed
  - T-029 completed
- intake_source: T-029 audit finding on 2026-04-24 that TypeScript has reset ingress but no installed-line postmortem proof for `run_superseded` and `continuation_abandoned`
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, and installed-line reset/postmortem proof support
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before the TypeScript tenant claims installed sandbox parity against the Python line, installed reset proof must show that active runs are superseded and open continuations are abandoned through canonical reset/correction law rather than only proving reset ingress in isolation
- governing_design:
  - build_tenants/abiogenesis/typescript/design/M04_EVENT_INGRESS_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_EVENT_INGRESS_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_RESET_POSTMORTEM_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_RESET_POSTMORTEM_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M05_INSTALLED_RESET_POSTMORTEM_STRUCTURAL_CARRIER_DIAGRAM.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- source_assets:
  - build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py
  - build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py
- closure_law: closed because the installed-line TypeScript proof now demonstrates the repriced reset/postmortem effects the Python sandbox line treats as authoritative, and the audit/design surfaces now record that reprice explicitly

## Migration Declaration

- old_truth_path: TypeScript proves reset ingress but not installed postmortem outcomes
- new_truth_path: TypeScript proves installed reset drives canonical `run_superseded` and `continuation_abandoned` postmortem truth through one explicit `M05` installed proof boundary
- producers_old: `test_m04_event_ingress_integration.test.mjs`
- producers_new: installed-line reset/postmortem proof lanes plus updated qualification parity references
- consumers_old: reviewers inferring reset parity from command ingress alone
- consumers_new: installed sandbox parity review and later correction/postmortem claims

## Expected Build Output

- one installed-line reset/postmortem proof pack
- explicit proof for superseded runs and abandoned continuations
- updated parity references in `test_surface_map.md`

## Outcome

- design pack landed:
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_RESET_POSTMORTEM_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_RESET_POSTMORTEM_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_RESET_POSTMORTEM_STRUCTURAL_CARRIER_DIAGRAM.md`
- reset/postmortem qualification code landed under:
  - `build_tenants/abiogenesis/typescript/code/src/qualification/m05/reset_postmortem*.ts`
- installed proof harness now emits the two reset/postmortem observations through the real package surface
- the Python parity audit now records reset/postmortem parity as completed and repriced rather than missed-follow-up

## Verification

- `npm run build:semantic`
- `npm run lint:semantic`
- `npm run test:t032`
- `npm run test:semantic`
