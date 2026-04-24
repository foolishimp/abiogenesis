# T-027 Realize a tenant-local ABG common realization library for expectation derivation, contract carriers, and module-derived proof helpers

- id: T-027
- title: Realize a tenant-local ABG common realization library for expectation derivation, contract carriers, and module-derived proof helpers
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-abg-common-realization-library-wave
- change_intent: Add one tenant-local reusable ABG common realization library so repeated expectation-derivation logic, subordinate contract/policy carriers, and module-derived proof helpers stop being rediscovered piecemeal inside each TypeScript wave.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-015 completed
  - T-024 completed
  - T-026 reviewed
- intake_source: post-ticket `DESIGN_MODULE_METHOD` review on `T-026` found the same residual pattern recurring again: canonical expectation truth and subordinate contract/policy carriers are governed by method/design law but still rebuilt wave-by-wave because the tenant has shared method law without a reusable ABG realization library
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/shared/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- authoritative_contract: before more cross-cutting TypeScript waves absorb the same residuals again, the tenant must declare one explicit reusable ABG common realization library for canonical expectation derivation, subordinate contract/policy carriers, and module-derived proof helpers; that library must remain tenant-local, preserve existing semantic boundaries, and not propagate to `build_tenants/common/` unless separately repriced later
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md
  - build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_OPTIMIZATION_LEDGER.md
  - build_tenants/abiogenesis/typescript/design/MIGRATED_TYPESCRIPT_DESIGN_SOURCE_AUDIT.md
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- constitutional_requirements:
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - specification/requirements/abg/README.md
  - specification/requirements/product/REQ-P-QUAL.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-026-realize-typescript-m03-governed-fp-transport-and-result-artifact-protocol-under-explicit-transport-law.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-015-front-run-the-remaining-typescript-tenant-design-and-module-derivation-from-the-released-python-reference.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_OPTIMIZATION_LEDGER.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
- target_truth: the TypeScript tenant has one explicit reusable ABG common realization library for cross-cutting expectation derivation, subordinate contract/policy carrier construction, and module-derived proof helpers, so later waves can consume those patterns without re-inventing them and without widening module ownership or public truth
- superseded_truth: the current tenant has strong design/module law and repeated local realizations of the same patterns, but no explicit reusable ABG realization library for those patterns beyond low-level validation primitives and ad hoc per-wave fixtures
- closure_law: this ticket closes only when the reusable library is declared, landed, and proven as a tenant-local boundary that reduces repeated rediscovery, preserves module ownership, does not change constitutional truth, and does not silently propagate into shared/common law

## Migration Declaration

- old_truth_path: repeated wave-local implementations of expectation derivation, subordinate contract/policy carriers, and module-derived proof setup remain scattered across `M03` and `M04` slices
- new_truth_path: one explicit tenant-local reusable ABG common realization library consumed by later TypeScript waves
- producers_old: per-wave `M03` and `M04` helpers, constructors, and test fixtures
- producers_new: tenant-local shared ABG library modules plus module-owned adapters into those modules
- consumers_old: current and future TypeScript waves that rebuild the same patterns locally
- consumers_new: later `M03`, `M04`, and `M05` TypeScript waves
- derived_surfaces:
  - expectation-derivation helpers
  - subordinate contract/policy carrier builders
  - module-derived proof helper lane

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

## Expected Build Output

- `ABG_COMMON_REALIZATION_LIBRARY_DERIVATION.md`
- `ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- `ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded tenant-local shared ABG library under `code/src/shared/abg_library/**`
- module-owned adapters proving at least `M03` transport and one `M04` consumer use the library without ownership drift
- `test_abg_common_realization_library_unit.test.mjs`
- `test_abg_common_realization_library_integration.test.mjs`
- `t027-abg-common-realization-library-negative.test.mjs`

## Current Implementation State

The required pre-code design assets are landed at:

- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`

The first code slice now lives at:

- `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/**`

Current consumers:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/**` for reusable dispatch-expectation and transport-contract realization
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m03-fixtures.mjs` for reusable proof-fixture profile payload shaping
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m04-fixtures.mjs` for reusable proof-fixture profile payload shaping

Still open in this ticket:

- wider `M03` and `M04` consumer adoption beyond the landed transport and support-fixture paths

The shared-library proof lanes now live at:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_abg_common_realization_library_unit.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_abg_common_realization_library_integration.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/t027-abg-common-realization-library-negative.test.mjs`

## TypeScript Source Asset Inventory

- `build_tenants/abiogenesis/typescript/code/src/shared/validation/primitives.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/**`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/**`
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m04-fixtures.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m03-fixtures.mjs`
- `.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md`
- `.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md`
- `.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md`
- `.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md`
- `.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md`
- `.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md`
- `.ai-workspace/tickets/completed/T-026-realize-typescript-m03-governed-fp-transport-and-result-artifact-protocol-under-explicit-transport-law.md`

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `build_tenants/abiogenesis/python/code/genesis/transport.py`
- `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`

## Source Reconciliation Checklist

- [x] tenant-local repeated expectation-derivation patterns identified and classified
- [x] tenant-local repeated subordinate contract/policy carrier patterns identified and classified
- [x] tenant-local repeated proof-helper/fixture patterns identified and classified
- [x] reusable pieces separated from module-owned pieces without ownership drift
- [x] Python reference line checked only where it materially informs the reusable library
- [x] every source asset above is reconciled, marked redundant, or linked to a later ticket

## Functional Realization Review Checklist

- [x] reusable library remains tenant-local and does not silently propagate into `build_tenants/common/`
- [x] expectation derivation consumes canonical upstream carrier truth rather than inventing helper-owned truth
- [x] subordinate contract/policy carriers remain nested and do not inflate prime/public boundaries
- [x] proof-helper extraction reduces duplication without making tests derive from code shape instead of module authority
- [x] later modules depend on the library with low coupling and one clear owner
- [x] local cleanup is absorbed here; any wider common/shared propagation creates its own ticket

## Impacted Interface Review Checklist

- [x] no module loses ownership of its semantic truth by using the library
- [x] no public package surface is widened just to expose reusable helpers
- [x] negative proof exists for open-payload or helper-bypass paths that the library is meant to replace

## Completion

It completes only when:

- the ABG common realization library design/module assets exist before shared code opens
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- at least one `M03` and one `M04` consumer prove the library works without ownership drift
- the reusable fix remains tenant-local and no shared/common propagation occurs without a separate ticket

## Closure Evidence

- `code/src/shared/abg_library/**` now owns the first tenant-local common
  realization library slice
- `code/src/abg/m03/transport/**` consumes reusable dispatch-expectation and
  transport-contract carriers without widening the owned `M03` protocol
  boundary
- `test_env/tests/support/m03-fixtures.mjs` and
  `test_env/tests/support/m04-fixtures.mjs` consume reusable proof-fixture
  profiles without moving `M03` or `M04` semantic ownership into the library
- `test_abg_common_realization_library_unit.test.mjs` green
- `test_abg_common_realization_library_integration.test.mjs` green
- `t027-abg-common-realization-library-negative.test.mjs` green
- `npm run test:t027` green
- `npm run test:semantic` green
- `npm run lint:semantic` green
