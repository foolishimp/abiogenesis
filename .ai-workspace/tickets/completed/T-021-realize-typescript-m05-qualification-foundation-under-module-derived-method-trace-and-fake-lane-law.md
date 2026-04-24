# T-021 Realize TypeScript `M05` qualification foundation under module-derived method-trace and fake-lane law

- id: T-021
- title: Realize TypeScript `M05` qualification foundation under module-derived method-trace and fake-lane law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m05-foundation-wave
- change_intent: Add the first TypeScript `M05` qualification foundation so method-trace gates and fake-lane scenario harnesses derive from shared and tenant-local module assets rather than from source-only happy-path tests.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - T-015 completed
  - T-018 completed
- intake_source: shared `M05` module law and Python qualification/test-surface reference
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/test_env/**`, future qualification surfaces
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- authoritative_contract: before `M05` code or qualification harness work opens, the tenant must declare one explicit qualification derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; method-trace and fake-lane scenario harnesses must derive from module/design truth rather than code shape
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/common/qualification/qualification_surface_map.md
  - build_tenants/common/qualification/qualification_refactor_loop.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/common/design/modules/M05-qualification-scenarios.yml
  - build_tenants/abiogenesis/python/test_env/test_surface_map.md
  - build_tenants/abiogenesis/python/test_env/tests/test_spec_method_trace.py
  - build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_fake.py
- constitutional_requirements:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- target_truth: one explicit TypeScript `M05` qualification foundation derives method-trace and fake-lane proof from module/design authority over completed `M01` through `M04` surfaces
- superseded_truth: the TypeScript tenant currently has module-derived tests but no dedicated `M05` qualification design or harness layer; Python qualification remains the only realized reference
- closure_law: this ticket closes only when the first TypeScript `M05` qualification foundation is declared and landed as module-derived method-trace and fake-lane proof over completed tenant modules, with no code-shaped test authority or sandbox-only substitution

## Migration Declaration

- old_truth_path: no TypeScript `M05` qualification foundation exists; Python method-trace and fake-lane scenario proof remain the only realized reference
- new_truth_path: one closed TypeScript `M05` qualification foundation over module-derived method-trace and fake-lane law
- producers_old: Python test authority and scenario harnesses
- producers_new: TypeScript qualification derivation assets and proof harnesses
- consumers_old: Python closure review and scenario qualification
- consumers_new: TypeScript closure review, later installed sandbox, and live-lane qualification
- derived_surfaces:
  - method-trace gate
  - fake-lane scenario harness
  - later installed sandbox and live-lane harnesses

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
  - module-derived proof fixture profiles
  - closed expectation and trace-gap carrier shaping for qualification lanes
  - fail-closed reusable proof requests over completed `M04` public/runtime truth
- library_extension_scope:
  - none unless this wave discovers a reusable qualification-proof pattern that
    crosses more than one later module boundary

## Expected Build Output

- `M05_QUALIFICATION_DERIVATION.md`
- `M05_QUALIFICATION_FIRST_SLICE_IACS.md`
- `M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `test_m05_method_trace_unit.test.mjs`
- `test_m05_fake_lane_integration.test.mjs`
- `t021-m05-qualification-negative.test.mjs`
- updated TypeScript `test_surface_map.md`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_REQUIREMENTS_TO_UAT.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_spec_method_trace.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_fake.py`

## Python Source Reconciliation Checklist

- [x] `python/design/GSDLC_LITE_QUALIFICATION_LADDER.md` reconciled into TypeScript `M05` foundation design
- [x] `python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md` reconciled into TypeScript scenario mapping proof
- [x] `python/design/SCENARIO_REQUIREMENTS_TO_UAT.md` reconciled into TypeScript scenario mapping proof
- [x] `python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md` reconciled into TypeScript fake-lane qualification proof
- [x] `python/test_env/test_surface_map.md` reconciled into TypeScript `test_surface_map.md`
- [x] `python/test_env/tests/test_spec_method_trace.py` reconciled into TypeScript method-trace proof
- [x] `python/test_env/tests/test_sandbox_usecases_fake.py` reconciled into TypeScript fake-lane proof

## Functional Realization Review Checklist

- [x] unit/integration qualification derives from module assets, not code layout
- [x] sandbox remains downstream of module-owned proof and does not replace it
- [x] method-trace gates point to live design/module truth
- [x] fake-lane qualification exercises completed modules without inventing runtime semantics

## Impacted Interface Review Checklist

- [x] `test_surface_map.md` names the new `M05` foundation lanes explicitly
- [x] method-trace gate consumes design/module assets, not only source file presence
- [x] fake-lane harness proves completed public/runtime surfaces rather than helper internals
- [x] negative proof shows stale or missing module authority fails qualification

## Required Break Order

1. derive the qualification foundation from Python proof surfaces and shared `M05` law
2. publish the qualification first-slice carrier and proof-lane assets
3. sever code-shaped or helper-shaped test authority as canonical proof
4. rebind TypeScript qualification to the admitted module-derived lanes
5. reprice later installed sandbox and live-lane proof around that foundation

## Break Contract

- Break 1 seam severed: code-shaped tests as canonical qualification authority
  - expected negative proof: missing module authority fails qualification
- Break 2 seam severed: sandbox-only proof standing in for module-derived qualification
  - expected negative proof: sandbox absence does not invalidate module-derived fake-lane proof, but missing fake-lane proof blocks closure

## Completion

It completes only when:

- the `M05` foundation design/module assets exist before code
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- TypeScript qualification now has a lawful module-derived foundation
- every Python source asset listed above is reconciled or explicitly marked redundant

## Completion Record

- status: completed
- completed_at: 2026-04-24
- design_method_review: pass with no residual closure blockers
- verification:
  - `npm run build:semantic`
  - `npm run lint:semantic`
  - `npm run test:t021`
  - `npm run test:semantic`
  - `git diff --check`
- delivered_artifacts:
  - `build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m05_method_trace_unit.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/test_m05_fake_lane_integration.test.mjs`
  - `build_tenants/abiogenesis/typescript/test_env/tests/t021-m05-qualification-negative.test.mjs`
