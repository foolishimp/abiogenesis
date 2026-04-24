# T-018 Realize TypeScript `M04` live-status projection over explicit runtime projection law

- id: T-018
- title: Realize TypeScript `M04` live-status projection over explicit runtime projection law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m04-live-status-wave
- change_intent: Add the first TypeScript `M04` live-status and observation projection surface as a closed projection family derived from admitted runtime and app truth rather than open-object status synthesis.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-015 completed
  - T-016 completed
  - T-017 completed
  - T-027 completed
- intake_source: shared `M04` runtime identity projection and live-status notes plus Python `live_status.py` reference
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before live-status code opens, the tenant must declare one explicit live-status derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; live-status remains a projection over admitted runtime/app truth and does not create a second closure authority
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/common/design/modules/M04-app-bootstrap.yml
  - build_tenants/abiogenesis/python/code/genesis/live_status.py
  - build_tenants/abiogenesis/python/test_env/test_surface_map.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- target_truth: one explicit TypeScript live-status projection family derives run, graph-call, runtime-identity, and artifact observation truth from admitted upstream carriers without synthesizing a rival semantic center
- superseded_truth: the TypeScript tenant currently has no explicit live-status projection surface; Python `live_status.py` remains the only realized reference
- closure_law: this ticket closes only when live-status projection is declared, landed, and proven as a read-model-only surface over admitted runtime and app truth, with no ability to close independently of canonical event and result truth

## Migration Declaration

- old_truth_path: no TypeScript live-status projection exists; Python `live_status.py` remains the only realized reference
- new_truth_path: one closed TypeScript live-status projection family over admitted upstream carriers
- producers_old: Python runtime and live-status projector
- producers_new: TypeScript runtime/app projection constructors
- consumers_old: Python operator UX and qualification surfaces
- consumers_new: TypeScript operator UX, install/bootstrap, and qualification surfaces
- derived_surfaces:
  - run-status projection
  - graph-call observation projection
  - result-artifact observation projection
  - later qualification and install surfaces

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
  - reusable proof-fixture profiles for runtime and public operator seams
  - explicit nested projection contract carriers
  - bounded projection trace shaping for module-derived proof lanes
- library_extension_scope: none in the first slice; any newly discovered reusable
  pattern beyond current library law requires explicit design review before code

## Expected Build Output

- `M04_LIVE_STATUS_DERIVATION.md`
- `M04_LIVE_STATUS_FIRST_SLICE_IACS.md`
- `M04_LIVE_STATUS_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded `code/src/app/m04/live_status/**` slice or equivalent
- `test_m04_live_status_unit.test.mjs`
- `test_m04_live_status_integration.test.mjs`
- `t018-m04-live-status-negative.test.mjs`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
- `build_tenants/abiogenesis/python/code/genesis/projection.py`
- `build_tenants/abiogenesis/python/code/genesis/run.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_m04_app_bootstrap_integration.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py`

## Python Source Reconciliation Checklist

- [x] `python/design/ABG_3_MODULE_DESIGN.md` reconciled for projection-only ownership
- [x] `python/code/genesis/live_status.py` reconciled into TypeScript live-status design and proof
- [x] `python/code/genesis/projection.py` reconciled where canonical projection expectations constrain status projection
- [x] `python/code/genesis/run.py` reconciled where run-status truth constrains live-status projection
- [x] `python/test_env/tests/test_m04_app_bootstrap_integration.py` reconciled into TypeScript live-status proof lanes
- [x] `python/test_env/tests/test_abg3_runtime_envelope.py` reconciled where runtime envelope truth constrains live-status projection

## Functional Realization Review Checklist

- [x] live-status remains projection-only and cannot become a second closure authority
- [x] runtime identity and configured worker/build/backend truth stay explicit
- [x] projection surfaces derive from admitted carriers instead of open dict synthesis
- [x] no app helper invents missing status or artifact truth

## Impacted Interface Review Checklist

- [x] public or package-facing status readers consume projection carriers only
- [x] no projection helper imports raw kernel payloads and rebuilds status independently
- [x] negative proof shows projection cannot pass when canonical upstream carriers are absent

## Required Break Order

1. derive the live-status surface from Python reference and shared `M04` law
2. publish the live-status first-slice projection family
3. sever any open-object status synthesis or app-side fallback status path
4. rebind operator/status consumers to the admitted projection family
5. reprice later qualification and install consumers

## Break Contract

- Break 1 seam severed: open-object or fallback status synthesis beside admitted projection carriers
  - expected negative proof: removing the new projection causes consumers to fail closed
- Break 2 seam severed: projection closes independently of canonical upstream truth
  - expected negative proof: stale or absent upstream carriers do not yield green projected status

## Completion

It completes only when:

- the live-status design/module assets exist before code
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- the live-status surface remains projection-only over admitted runtime/app truth
- every Python source asset listed above is reconciled or explicitly marked redundant

## Completion Record

- design/module assets landed:
  - `build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_STRUCTURAL_CARRIER_DIAGRAM.md`
- code boundary landed:
  - `build_tenants/abiogenesis/typescript/code/src/app/m04/live_status/**`
- proof lanes landed:
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_live_status_unit.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_live_status_integration.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/t018-m04-live-status-negative.test.mjs`
- verification:
  - `npm run build:semantic`
  - `npm run lint:semantic`
  - `npm run test:t018`
  - `npm run test:semantic`
  - `git diff --check`
- post-ticket design review:
  - no remaining local closure defects
  - no new cross-boundary triage beyond the completed `T-027` commonization wave
