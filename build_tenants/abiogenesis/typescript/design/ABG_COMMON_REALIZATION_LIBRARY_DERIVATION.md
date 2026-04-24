# ABG Common Realization Library Derivation

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Derive a tenant-local reusable ABG common realization library from
the already-landed `M03` and `M04` waves so repeated expectation derivation,
nested contract/policy carriers, and module-derived proof helpers stop being
rediscovered wave-by-wave.

## 1. Source Material

This library derives from:

- `build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/**`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/control/**`
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m03-fixtures.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m04-fixtures.mjs`
- `build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_OPTIMIZATION_LEDGER.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `build_tenants/abiogenesis/python/code/genesis/transport.py`
- `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`

## 2. Position

The current tenant already has strong design/module law, but three realization
patterns are still rebuilt locally:

- canonical expectation derivation from closed upstream carriers
- nested contract/policy carrier construction
- module-derived proof helper and fixture shaping

Those patterns are not product truth and should not keep being rediscovered
inside every owning module.

## 3. Preserved Ownership

This library does not become a new semantic center.

It preserves:

- `M03` ownership of transport/result protocol truth
- `M04` ownership of public-start and control-loop truth
- module-owned adapters that map module truth into reusable library carriers
- module-derived test authority tied back to IACS and structural diagrams

It demotes only the repeated realization mechanics.

## 4. First Slice Target

The first library slice should realize exactly these reusable families:

1. one reusable dispatch-expectation family
2. one reusable agent transport-contract family with nested sanitization policy
3. one reusable proof-fixture profile family for published work and runtime
   context setup

The first concrete consumers are:

- `M03` transport for reusable expectation and transport-contract carriers
- `M03` and `M04` proof lanes for reusable fixture profiles

## 5. Library Boundary Rule

The library lives under:

- `code/src/shared/abg_library/**`

It may provide:

- typed readonly library carriers
- pure constructors and derivation helpers
- proof-helper builders used by module-owned tests

It may not provide:

- public package-facing product carriers
- rival runtime or app truth
- ambient registries, mutable caches, or global state
- shared/common propagation outside this tenant

## 6. Repriced Local Detail

This wave intentionally demotes these local mechanics from module architecture:

- ad hoc `expectedEdge` derivation inside `M03` transport constructors
- ad hoc `expectedAssessmentIds` derivation inside `M03` transport constructors
- repeated nested transport-contract construction inside transport code
- repeated published-work and runtime-identity fixture shaping across `M03` and
  `M04` tests

Those are realization-library concerns, not module-owned semantic law.

## 7. Non-Goals

This first library slice does not include:

- shared propagation into `build_tenants/common/`
- generic code-generation templates
- app/bootstrap doctrine
- runtime event ownership
- result-assessment or event-ingress semantics
- package export widening for library internals

## 8. Required Assets

Before shared code opens, this derivation requires:

- `ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- `ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
- strict-lane coverage for `code/src/shared/abg_library/**`
- module-derived proof lanes for the library itself

## 9. Consequence

Later implementation under `T-027` should open only:

- `code/src/shared/abg_library/**`

Then `T-026` and later tickets consume that library through local adapters.
The library is durable. The ticket is the governance vehicle that can extend it
lawfully.
