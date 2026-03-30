# Abiogenesis Qualification Refactor Loop

**Status**: Active
**Date**: 2026-03-29
**Derived from**: [REQ-P-QUAL.md](../../../specification/requirements/product/REQ-P-QUAL.md), [REQ-P-SCENARIOS.md](../../../specification/requirements/product/REQ-P-SCENARIOS.md), [module_decomp.md](../design/module_decomp.md), [qualification_surface_map.md](./qualification_surface_map.md), [test_surface_map.md](../../abiogenesis/python/test_env/test_surface_map.md)

## Purpose

Refactor the canonical `abiogenesis/python` qualification surface from legacy unit-first test shapes into module-aligned qualification lanes derived from live requirements and design.

This is a transformation-wave surface.
It does not change current release behavior on its own.

## Refactor Rules

- Shared module ownership in `build_tenants/common/design/modules/` is the primary source for qualification lane boundaries.
- New canonical qualification shall be integration-first and scenario-first.
- Property tests remain lawful only when they validate explicit algebraic or replay invariants named in live requirements and design.
- Legacy unit tests are not authoritative merely because they are small or numerous.
- During the wave, legacy tests may remain as shadow oracles until replacement lanes prove equal or better requirement/design coverage.
- When a replacement lane lands, the superseded unit lane should be deleted rather than retained as ambient overlap.

## Target Qualification Shape

| Module | Target qualification lane | Primary evidence style |
| --- | --- | --- |
| `M01-gtl-core` | language-contract integration lane | graph/function/operator programs checked through authored GTL surfaces |
| `M02-work-publication` | publication and package-boundary lane | module/job/role/package loading and authored package selection behavior |
| `M03-engine-kernel` | engine-kernel integration lane | replay, binding, convergence, selection, provenance, transport, interpret |
| `M04-app-bootstrap` | app/bootstrap integration lane | services, CLI adapter, install/bootstrap, project-facing operations |
| `M05-qualification-scenarios` | end-to-end scenario lane | deterministic sandbox, live sandbox, archive proof, method trace |

## Current Review Of Canonical Python Tests

### Keep As Current Integration Anchors

These already behave like real integration or scenario surfaces and should anchor the replacement corpus.

| Test file | Module alignment | Reason |
| --- | --- | --- |
| `test_provenance_integration.py` | `M03-engine-kernel` | checks live provenance behavior across integrated runtime surfaces |
| `test_m01_gtl_core_integration.py` | `M01-gtl-core` | canonical integration lane for graph algebra, higher-order operators, and structural alternatives |
| `test_m02_work_publication_integration.py` | `M02-work-publication` | canonical integration lane for authored package publication, jobs, roles, and traversal boundaries |
| `test_m03_engine_kernel_integration.py` | `M03-engine-kernel` | canonical integration lane for selection, traversal, run/replay, and convergence over real kernel surfaces |
| `test_m04_app_bootstrap_integration.py` | `M04-app-bootstrap` | canonical integration lane for subprocess transport policy, retry, timeout, and bootstrap boundary |
| `test_run_archive.py` | `M05-qualification-scenarios` | validates archive proof surfaces end to end |
| `test_v2_sandbox_install.py` | `M04-app-bootstrap`, `M05-qualification-scenarios` | checks sandbox install/bootstrap path in a real workspace |
| `test_v2_sandbox_usecases_fake.py` | `M05-qualification-scenarios` | canonical deterministic scenario ladder |
| `test_v2_sandbox_usecases_live.py` | `M05-qualification-scenarios` | canonical live scenario ladder |
| `test_v2_usecases_u1_u4.py` | `M03-engine-kernel`, `M05-qualification-scenarios` | user-facing scenario integration over the authored GTL/ABG surface |
| `test_spec_method_trace.py` | `M05-qualification-scenarios` | constitutional method gate for the migrated project |

### Remaining Rewrite Candidates

None in the canonical python suite after the current cutover.

### Retired Legacy ABG Contract Cluster

These were superseded by `test_m03_engine_kernel_integration.py` and should not return as parallel authority surfaces.

| Retired test file | Replacement lane |
| --- | --- |
| `test_abg_traversal.py` | `test_m03_engine_kernel_integration.py` |
| `test_abg_selection.py` | `test_m03_engine_kernel_integration.py` |
| `test_abg_convergence.py` | `test_m03_engine_kernel_integration.py` |

### Retired Legacy GTL And Publication Contract Cluster

These were superseded by the new `M01` and `M02` integration lanes and should not return as parallel authority surfaces.

| Retired test file | Replacement lane |
| --- | --- |
| `test_algebra.py` | `test_m01_gtl_core_integration.py` |
| `test_algebra_v2.py` | `test_m01_gtl_core_integration.py` |
| `test_gtl_types.py` | `test_m01_gtl_core_integration.py` |
| `test_v2_contract_semantics.py` | `test_m02_work_publication_integration.py` |
| `test_v2_domain_scenarios.py` | `test_m02_work_publication_integration.py` |

### Retired Legacy Refinement And Property Cluster

These were absorbed into the module-owned `M01` and `M03` lanes and should not
return as parallel authority surfaces.

| Retired test file | Replacement lane |
| --- | --- |
| `test_v2_product_scenarios_refinement.py` | `test_m01_gtl_core_integration.py`, `test_m03_engine_kernel_integration.py` |
| `test_property_invariants.py` | `test_m03_engine_kernel_integration.py` |

### Retired Legacy Transport Contract Cluster

These were absorbed into the module-owned `M04` lane and should not return as
parallel authority surfaces.

| Retired test file | Replacement lane |
| --- | --- |
| `test_transport_contract.py` | `test_m04_app_bootstrap_integration.py` |

### Legacy Unit Or Property Surfaces Still To Re-derive

These should not define the long-term canonical qualification shape.

| Test file | Current issue | Refactor direction |
| --- | --- | --- |
None in the canonical python suite after the current cutover.

## Wave Rule

The current corpus remains valid for release support while the new module-aligned lanes are built.

The migration does not complete when new tests merely exist.
It completes when:

- replacement lanes cover the same or better live requirement/design authority
- the released deterministic and scenario lanes stay green
- superseded legacy tests are deleted
