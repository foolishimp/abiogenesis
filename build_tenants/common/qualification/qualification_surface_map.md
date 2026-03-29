# Abiogenesis Qualification Surface Map

**Status**: Active
**Date**: 2026-03-29
**Derived from**: [REQ-P-QUAL.md](/Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-QUAL.md), [REQ-P-SCENARIOS.md](/Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-SCENARIOS.md), [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md), [build_tenants/abiogenesis/python/test_env/README.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/README.md), [build_tenants/abiogenesis/codex/tests/README.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/codex/tests/README.md)

## Purpose

Make the current shared-vs-tenant qualification boundary explicit during the `abiogenesis` migration to `gsdlc 1.0`.

This surface is structural only.
It does not change test behavior, selection, or release criteria.

## Classification Rules

- product qualification and scenario authority lives in `REQ-P-QUAL` and `REQ-P-SCENARIOS`
- `build_tenants/common/qualification/` holds tenant-local qualification law that is genuinely shared across realizations
- `build_tenants/abiogenesis/python/test_env/` remains the canonical released qualification root
- `build_tenants/abiogenesis/codex/tests/` remains a paused comparison qualification root
- promote a qualification surface to `common` only when more than one tenant consumes it unchanged, or when it is rewritten as tenant-neutral law

## Current Shared Qualification Law

At this migration stage, the only shared qualification surface is this classification map itself.

Executable qualification remains tenant-local.

## Canonical Shared-Candidate Qualification Surfaces Still Held In Python

These surfaces currently govern the released python qualification story but are not yet promoted into `common`.

| Surface | Current location | Why not yet promoted |
| --- | --- | --- |
| `GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md` | `build_tenants/abiogenesis/python/design/` | Canonical qualification ladder, but still written around the python tenant's active sandbox and scenario corpus |
| `test_surface_map.md` | `build_tenants/abiogenesis/python/test_env/` | Canonical reviewed trace map for the python tenant test corpus |
| `test_spec_method_trace.py` | `build_tenants/abiogenesis/python/test_env/tests/` | Current repo-level constitutional trace gate for the canonical tenant |
| `run_archive.py` and `sandbox_runtime.py` | `build_tenants/abiogenesis/python/test_env/tests/` | Canonical sandbox/archive harness, not yet exercised unchanged by another active tenant |

Promotion trigger:

- a second active tenant consumes the same qualification surface unchanged, or
- the surface is rewritten as tenant-neutral shared qualification law

## Python-Tenant Qualification Surfaces

These remain canonical and tenant-local by design.

| Surface family | Reason |
| --- | --- |
| `test_env/tests/test_algebra*.py`, `test_gtl_types.py`, `test_abg_*.py`, `test_property_invariants.py`, `test_provenance_integration.py` | Canonical python contract and deterministic engine qualification |
| `test_env/tests/test_v2_sandbox_*.py`, `test_v2_usecases_u1_u4.py`, `test_run_archive.py` | Canonical sandbox, archive, and scenario qualification |
| `test_env/tests/helpers_*.py`, `run_archive.py`, `sandbox_runtime.py`, `run_tests` | Python tenant qualification harness support |

## Codex Comparison Qualification Surfaces

These remain local to the paused comparison tenant.

| Surface family | Reason |
| --- | --- |
| `build_tenants/abiogenesis/codex/tests/` | Historical comparison and migration reference, not the released qualification lane |

## Migration Rule

During this migration phase:

- classify before moving
- preserve the released python qualification behavior
- avoid inventing a shared executable test root before a second active tenant actually needs it
