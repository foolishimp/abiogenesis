# T-015 Front-run the remaining TypeScript tenant design and module derivation from the released Python reference

- id: T-015
- title: Front-run the remaining TypeScript tenant design and module derivation from the released Python reference
- type: spike
- ticket_category: implementation_migration
- migration_strategy: fundamental_re_adoption
- status: completed
- goal: typescript-tenant-reference-front-run-wave
- change_intent: Before any later TypeScript implementation wave opens, reconcile the remaining Python `M03`, `M04`, `M05`, and deferred `M06` surfaces into tenant-local TypeScript derivation docs, IACS assets, structural carrier diagrams, module-derived test lanes, and one explicit optimization ledger.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-024 completed
  - T-014 completed
  - released Python tenant remains the deterministic reference line
- intake_source: user direction on 2026-04-24 to front-run remaining TypeScript design and module assets from the original Python tenant before more implementation opens
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `.ai-workspace/tickets/`, and the remaining TypeScript backlog chain for late `M03`, `M04`, `M05`, and deferred `M06`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- authoritative_contract: before any later TypeScript implementation wave opens, the remaining Python reference surfaces must be adjudicated into tenant-local TypeScript module truth under explicit carry-across, rewrite, or redundant classifications; local optimization opportunities must be recorded for absorption within the owning future wave; cross-boundary opportunities must become triage tickets rather than silent rewrite scope
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md
  - build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_OPTIMIZATION_LEDGER.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_REALIZATION_GUARDRAILS.md
  - build_tenants/common/design/module_decomp.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
  - build_tenants/common/design/modules/M05-qualification-scenarios.yml
  - build_tenants/common/design/modules/M06-mapping-deferred.yml
  - build_tenants/abiogenesis/python/design/README.md
  - build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/python/test_env/test_surface_map.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- constitutional_requirements:
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-016-realize-typescript-m04-event-ingress-over-the-canonical-kernel-emission-surface.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-017-realize-typescript-m04-result-assessment-ingress-over-canonical-result-ingest-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-018-realize-typescript-m04-live-status-projection-over-explicit-runtime-projection-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-019-realize-typescript-m04-install-bootstrap-under-package-first-installed-runtime-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-020-realize-typescript-m04-bootloader-and-project-facing-delivery-operations-under-explicit-bootloader-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-021-realize-typescript-m05-qualification-foundation-under-module-derived-method-trace-and-fake-lane-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-022-realize-typescript-m05-installed-sandbox-live-lane-and-archive-proof-under-explicit-installed-runtime-qualification-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-023-adjudicate-typescript-m06-mapping-deferred-trigger-boundary-under-explicit-deferred-only-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-025-realize-typescript-m04-public-asset-addressing-through-a-published-operator-asset-registry.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-026-realize-typescript-m03-governed-fp-transport-and-result-artifact-protocol-under-explicit-transport-law.md
- target_truth: the remaining TypeScript backlog is front-run by explicit tenant-local derivation, module, and proof assets for late `M03`, `M04`, `M05`, and deferred `M06`, with optimization opportunities classified as local absorb-now or cross-boundary triage before implementation begins
- superseded_truth: the TypeScript tenant currently has completed `M01` through `M04` control-loop and lookup waves, but the remaining late `M03` / `M04` / `M05` / `M06` surfaces are still only implicit in shared module law, Python reference code, and deferred registers rather than exhaustively adjudicated into target TypeScript module assets
- closure_law: this ticket closes only when the remaining Python reference surfaces have been adjudicated into explicit TypeScript derivation assets, first-slice IACS assets, Mermaid structural carrier diagrams, module-derived unit/integration/negative proof lane declarations, and an optimization ledger that distinguishes local cleanup from cross-boundary triage follow-up

## Migration Declaration

- old_truth_path: remaining future TypeScript work is inferred ad hoc from shared module law, Python code scans, and deferred registers
- new_truth_path: remaining future TypeScript work is declared explicitly as reference-derived module assets and successor tickets before implementation opens
- producers_old: local reviewer memory, Python code inspection, and deferred notes in current TypeScript IACS assets
- producers_new: tenant-local derivation documents, IACS assets, structural carrier diagrams, and successor backlog tickets
- consumers_old: future ticket authors, future implementors, and closure reviewers
- consumers_new: future ticket authors, future implementors, closure reviewers, and strict-lane/test-surface derivation
- derived_surfaces:
  - remaining `M04` implementation tickets
  - remaining `M05` qualification tickets
  - deferred `M06` trigger ticket
  - TypeScript test surface map updates
  - optimization/triage backlog

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Sideways Reference Line

- sideways_reference_line: `build_tenants/abiogenesis/python/` released tenant design, code, and proof surfaces
- module_and_interface_adjudication_surface:
  - `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
  - `build_tenants/common/design/modules/M04-app-bootstrap.yml`
  - `build_tenants/common/design/modules/M05-qualification-scenarios.yml`
  - `build_tenants/common/design/modules/M06-mapping-deferred.yml`

## Inherited Surface Adjudication

- `M04` event-ingress family: `rewrite`
- `M04` result-assessment ingress family: `rewrite`
- `M04` live-status / observation projection family: `rewrite`
- `M04` install/bootstrap family: `rewrite`
- `M04` bootloader/project-facing operations family: `rewrite`
- `M03` governed transport and result-artifact protocol family: `rewrite`
- `M04` public asset-addressing and operator asset registry family: `rewrite`
- `M05` method-trace and fake-lane qualification family: `rewrite`
- `M05` installed sandbox, live-lane, and archive proof family: `rewrite`
- `M06` alternate-runtime mapping family: `carry_across` as deferred trigger boundary only; no active implementation
- Python CLI/bootstrap helper spellings: `redundant` as authority surfaces; they remain reference evidence only
- Python scenario and sandbox proof obligations: `carry_across` as target proof intent, but `rewrite` as TypeScript tenant-local module-derived proof lanes

## Context

The TypeScript tenant has already completed:

- `M01-gtl-core`
- `M02-work-publication`
- `M03-engine-kernel`
- the first `M04` public-start and control-loop slices
- the `M02 -> M03` lookup-authority repricing

The remaining work is still lawful but underdeclared. The next waves are known
in shared module law and Python reference code, but the TypeScript tenant does
not yet have an exhaustive forward derivation pack for those remaining module
families.

## Expected Build Output

This ticket is expected to produce approximately:

- one adjudicated forward plan for remaining `M04` surfaces
- one adjudicated forward plan for remaining late `M03` transport/result surfaces
- one adjudicated forward plan for remaining `M05` qualification surfaces
- one deferred trigger plan for `M06`
- one optimization ledger with:
  - local absorb-now opportunities
  - cross-boundary opportunities that require triage tickets
- one complete backlog chain for remaining TypeScript waves

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md`
- `build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_REQUIREMENTS_TO_UAT.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/binding.py`
- `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
- `build_tenants/abiogenesis/python/code/genesis/transport.py`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
- `build_tenants/abiogenesis/python/code/gen-install.py`
- `build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_m04_app_bootstrap_integration.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_fake.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_spec_method_trace.py`

## Python Source Reconciliation Checklist

- [x] `python/design/README.md` reconciled into remaining TypeScript tenant wave map
- [x] `python/design/ABG_3_MODULE_DESIGN.md` reconciled into remaining `M04` / `M05` / `M06` TypeScript module targets
- [x] `python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md` reconciled into future public asset-addressing or explicit redundant classification
- [x] `python/design/GSDLC_LITE_QUALIFICATION_LADDER.md` reconciled into future `M05` qualification design
- [x] `python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md` reconciled into future scenario proof surfaces
- [x] `python/design/SCENARIO_REQUIREMENTS_TO_UAT.md` reconciled into future scenario proof surfaces
- [x] `python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md` reconciled into future scenario proof surfaces
- [x] `python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md` reconciled into future transport/result protocol design
- [x] `python/code/genesis/cli_adapter.py` classified for carry/rewrite/redundant across future `M04` ingress and control families
- [x] `python/code/genesis/binding.py` classified for remaining runtime-binding or asset-addressing follow-up
- [x] `python/code/genesis/result_ingest.py` classified for future result-assessment ingress
- [x] `python/code/genesis/transport.py` classified for future result/ingress and installed qualification surfaces
- [x] `python/code/genesis/live_status.py` classified for future live-status projection
- [x] `python/code/gen-install.py` classified for future install/bootstrap and bootloader delivery
- [x] `python/code/gtl_spec/GTL_BOOTLOADER.md` classified for future bootloader delivery
- [x] `python/test_env/test_surface_map.md` reconciled into future TypeScript test-surface expansion
- [x] `python/test_env/tests/test_cli_adapter_auto.py` reconciled into future `M04` event/control proof
- [x] `python/test_env/tests/test_m04_app_bootstrap_integration.py` reconciled into future `M04` product-facing proof
- [x] `python/test_env/tests/test_run_archive.py` reconciled into future `M05` archive proof
- [x] `python/test_env/tests/test_sandbox_install.py` reconciled into future installed sandbox proof
- [x] `python/test_env/tests/test_sandbox_usecases_fake.py` reconciled into future `M05` fake-lane proof
- [x] `python/test_env/tests/test_sandbox_usecases_live.py` reconciled into future `M05` live-lane proof
- [x] `python/test_env/tests/test_spec_method_trace.py` reconciled into future method-trace proof

## Functional Realization Review Checklist

- [x] Python remains deterministic reference evidence, not current constitutional authority
- [x] every remaining surface is classified `carry_across`, `rewrite`, or `redundant`
- [x] later TypeScript code does not open before its derivation, IACS, and structural carrier diagram exist
- [x] optimization reasoning distinguishes local cleanup from cross-boundary repricing
- [x] every cross-boundary opportunity becomes a triage ticket rather than hidden scope growth

## Impacted Interface Review Checklist

- [x] remaining `M04` public ingress and control surfaces are enumerated from shared law and Python reference
- [x] remaining `M04` delivery/install and bootloader surfaces are enumerated from shared law and Python reference
- [x] remaining `M05` fake/live/archive/install proof lanes are enumerated from Python test authority
- [x] deferred `M06` trigger conditions are explicit instead of implied
- [x] later TypeScript `test_surface_map.md` updates can be derived from these assets without invention

## Completion

It completes only when:

- the remaining late `M03`, `M04`, `M05`, and deferred `M06` surfaces are exhaustively tracked in backlog tickets
- each future implementation wave names its future derivation, IACS, diagram, and proof-lane assets
- local vs cross-boundary optimization reasoning is explicit
- later implementation may start from these tickets without needing a new ad hoc backlog discovery pass
- every Python source asset listed above is either reconciled into a future wave or explicitly marked redundant

## Current Result

The remaining-wave front-run assets are now landed at:

- `build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md`
- `build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_OPTIMIZATION_LEDGER.md`

The future backlog chain is now explicit across:

- `T-016`
- `T-017`
- `T-018`
- `T-019`
- `T-020`
- `T-021`
- `T-022`
- `T-023`
- `T-025`
- `T-026`

## Closure Note

`T-015` closed on 2026-04-24 after the TypeScript tenant:

- produced one explicit remaining-wave forward derivation baseline after the
  `T-024` source audit
- produced one optimization ledger that separates local absorb-now cleanup from
  cross-boundary repricing
- reconciled the remaining Python design, code, and proof sources into the
  future TypeScript backlog chain
- updated the TypeScript test-surface posture so later canonical lanes derive
  from the front-run module plan rather than ticket prose alone
