# T-016 Realize TypeScript `M04` event-ingress over the canonical kernel emission surface

- id: T-016
- title: Realize TypeScript `M04` event-ingress over the canonical kernel emission surface
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m04-event-ingress-wave
- change_intent: Add the first TypeScript `M04` event-ingress boundary as a closed public ingress family for app-owned review or correction commands that validates foreign input and routes it through canonical kernel-owned emission truth rather than appending runtime facts directly.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-015 completed
  - T-013 completed
  - T-014 completed
  - T-026 completed
  - T-027 completed
- intake_source: remaining deferred `M04` event-ingress surface in shared module law, reconciled against the released Python CLI event command and the completed TypeScript `M03` emit boundary
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before event-ingress code opens, the tenant must declare one explicit event-ingress derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; the first slice is bounded to app-owned `approved`, `revoked`, and `reset` command ingress, while `assessed` or result-artifact ingress remains deferred to `T-017`
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
  - build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/python/test_env/test_surface_map.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-015-front-run-the-remaining-typescript-tenant-design-and-module-derivation-from-the-released-python-reference.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-026-realize-typescript-m03-governed-fp-transport-and-result-artifact-protocol-under-explicit-transport-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-027-realize-a-tenant-local-abg-common-realization-library-for-expectation-derivation-contract-carriers-and-module-derived-proof-helpers.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/events.py
- target_truth: one admitted TypeScript `M04` event-ingress boundary now routes app-owned `approved`, `revoked`, or `reset` ingress through canonical emission truth without direct event append or rival public runtime carriers
- superseded_truth: the former TypeScript absence of explicit event-ingress has now been replaced by the bounded first-slice event-ingress family; Python CLI event ingress remains reference evidence rather than the only realized path
- closure_law: this ticket closes only when the first event-ingress boundary is declared, landed, and proven as one closed public ingress family for `approved`, `revoked`, and `reset` command truth that validates foreign input, preserves explicit provenance inputs, and routes all runtime facts through canonical emission rather than app-side event writes

## First Slice Boundary

The first slice is intentionally narrower than the full Python event command.

Included in `T-016` first slice:

- `approved`
- `revoked`
- `reset`

Explicitly deferred from `T-016` first slice:

- `assessed`
- result-artifact ingestion
- fulfillment-ledger publication
- later live-status or install/bootstrap widening

Those deferred surfaces remain successor-ticket work, especially `T-017`.

## Migration Declaration

- old_truth_path: no TypeScript event-ingress exists; Python CLI event command remains the only realized review or correction ingress path
- new_truth_path: one closed TypeScript review or correction event-ingress family over canonical kernel-owned emission law
- producers_old: Python CLI event command and Python event validator
- producers_new: TypeScript event-ingress admission and route binding
- consumers_old: Python app bootstrap, runtime, and qualification surfaces
- consumers_new: TypeScript control-loop, later app bootstrap, later qualification surfaces
- derived_surfaces:
  - public event-ingress package surface
  - bounded extension to the canonical emission family when first-slice event records are admitted
  - later result-assessment routing
  - later live-status projection
  - later qualification lanes

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
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/**`
- recurring_patterns:
  - expectation derivation for app-owned emit contracts
  - nested contract or policy carrier realization
  - module-derived proof-helper profiles
- library_extension_scope: none in the first slice; any newly discovered reusable pattern beyond current library law requires explicit design review before code

## Expected Build Output

- `M04_EVENT_INGRESS_DERIVATION.md`
- `M04_EVENT_INGRESS_FIRST_SLICE_IACS.md`
- `M04_EVENT_INGRESS_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded `code/src/app/m04/event_ingress/**` slice or equivalent module-owned surface
- one bounded supporting extension to `code/src/abg/m03/events/**` and `code/src/abg/m03/contracts/**` only if required by the first-slice canonical emit path
- `test_m04_event_ingress_unit.test.mjs`
- `test_m04_event_ingress_integration.test.mjs`
- `t016-m04-event-ingress-negative.test.mjs`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/events.py`
- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_m04_app_bootstrap_integration.py`

## Deferred Python Source Assets Outside First Slice

- `build_tenants/abiogenesis/python/code/genesis/result_ingest.py` -> `T-017`
- `build_tenants/abiogenesis/python/code/genesis/transport.py` -> `T-017`

## Python Source Reconciliation Checklist

- [x] `python/design/ABG_3_MODULE_DESIGN.md` reconciled for event-ingress ownership and canonical emit routing
- [x] `python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md` reconciled for public entry semantics
- [x] `python/code/genesis/cli_adapter.py` reconciled for app-owned `approved` or `revoked` or `reset` ingress behavior
- [x] `python/code/genesis/events.py` reconciled for canonical emit ownership and reset follow-up ownership below ingress
- [x] `python/code/genesis/interpret.py` reconciled for kernel-owned runtime truth below the ingress boundary
- [x] `python/test_env/tests/test_cli_adapter_auto.py` reconciled into TypeScript event-ingress proof lanes
- [x] `python/test_env/tests/test_m04_app_bootstrap_integration.py` reconciled into TypeScript event-ingress integration proof
- [x] deferred `result_ingest.py` and `transport.py` assets explicitly left to `T-017`

## Functional Realization Review Checklist

- [x] event-ingress remains app-owned routing over kernel truth rather than a rival semantic center
- [x] ingress validates once and then carries closed typed truth inward
- [x] no function both decides runtime meaning and writes runtime facts directly
- [x] event persistence or append remains kernel-owned through canonical emit
- [x] first-slice command variants stay bounded to `approved`, `revoked`, and `reset`
- [x] local cleanup is absorbed only inside the owned first slice; cross-boundary opportunities create triage tickets

## Impacted Interface Review Checklist

- [x] public package event-ingress entrypoint consumes admitted event-ingress carriers only
- [x] no `M04` helper bypasses canonical `M03` or completed `M04` emit surfaces
- [x] control-loop and public-start surfaces remain upstream consumers, not silent alternate ingress
- [x] any bounded extension to the canonical `M03` emit family stays closed and carrier-owned
- [x] negative proof rejects open payload or direct event-append bypass

## Required Break Order

1. derive the event-ingress surface from Python reference and shared `M04` law
2. publish the bounded first-slice carrier family for `approved`, `revoked`, and `reset`
3. sever any direct app-side event append or open-object ingress path
4. rebind the event-ingress route to canonical emission
5. reprice public wrappers, proofs, and later consumers against the admitted event-ingress family

## Break Contract

- Break 1 seam severed: app-owned event append beside canonical kernel emission
  - expected negative proof: direct append bypass fails closed
- Break 2 seam severed: open-object ingress accepted as public event truth
  - expected negative proof: malformed ingress payload is rejected before route binding
- Break 3 seam severed: `assessed` or result-ingest truth accidentally enters the first slice
  - expected negative proof: result-artifact or assessed-style payload is rejected or left to `T-017`

## Completion

It completes only when:

- the event-ingress design/module assets exist before code
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- no direct app-side runtime event append remains in the active public ingress path
- every Python source asset listed above is reconciled or explicitly marked redundant
- deferred Python source assets are explicitly pointed at successor tickets rather than left implicit
