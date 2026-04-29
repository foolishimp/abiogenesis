# Abiogenesis Qualification Surface Map

**Status**: Active
**Date**: 2026-03-29
**Derived from**: [REQ-P-QUAL.md](../../../specification/requirements/product/REQ-P-QUAL.md), [REQ-P-SCENARIOS.md](../../../specification/requirements/product/REQ-P-SCENARIOS.md), [GSDLC_LITE_QUALIFICATION_LADDER.md](../../abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md), [build_tenants/abiogenesis/python/test_env/README.md](../../abiogenesis/python/test_env/README.md), [build_tenants/abiogenesis/codex/tests/README.md](../../abiogenesis/codex/tests/README.md), [qualification_refactor_loop.md](./qualification_refactor_loop.md)

## Purpose

Make the current shared-vs-tenant qualification boundary explicit during the active `abiogenesis` qualification cut.

This surface is structural only.
It does not change test behavior, selection, or release criteria.

## Classification Rules

- product qualification and scenario authority lives in `REQ-P-QUAL` and `REQ-P-SCENARIOS`
- `build_tenants/common/qualification/` holds tenant-local qualification law that is genuinely shared across realizations
- `build_tenants/abiogenesis/typescript/test_env/` is the primary TS release
  qualification root
- `build_tenants/abiogenesis/python/test_env/` remains a paused released
  reference qualification root
- `build_tenants/abiogenesis/codex/tests/` remains a paused comparison qualification root
- promote a qualification surface to `common` only when more than one tenant consumes it unchanged, or when it is rewritten as tenant-neutral law

## Current Shared Qualification Law

At this migration stage, the current shared qualification surfaces are:

- this classification map
- `build_tenants/common/qualification/qualification_refactor_loop.md`

Executable qualification remains tenant-local.

## Paused Shared-Candidate Qualification Surfaces Still Held In Python

These surfaces governed the released Python qualification story before the TS
primary-release reprice. They remain reference evidence but are not promoted
into `common` and are not active RC gates while Python is paused.

| Surface | Current location | Why not yet promoted |
| --- | --- | --- |
| `GSDLC_LITE_QUALIFICATION_LADDER.md` | `build_tenants/abiogenesis/python/design/` | Reference qualification ladder, still written around the Python tenant's sandbox and scenario corpus |
| `test_surface_map.md` | `build_tenants/abiogenesis/python/test_env/` | Reviewed trace map for the Python tenant reference test corpus |
| `test_spec_method_trace.py` | `build_tenants/abiogenesis/python/test_env/tests/` | Reference constitutional trace gate for the Python tenant |
| `run_archive.py` and `sandbox_runtime.py` | `build_tenants/abiogenesis/python/test_env/tests/` | Reference sandbox/archive harness, not yet exercised unchanged by the primary TS tenant |

Promotion trigger:

- a second active tenant consumes the same qualification surface unchanged, or
- the surface is rewritten as tenant-neutral shared qualification law

## Paused Python-Tenant Qualification Surfaces

These remain tenant-local reference surfaces by design. They are not active
release gates while the tenant registry marks Python paused.

| Surface family | Reason |
| --- | --- |
| `test_env/tests/test_m01_*.py`, `test_m02_*.py`, `test_m03_*.py`, `test_m04_*.py`, `test_provenance_integration.py` | Reference module-aligned Python contract and deterministic engine qualification |
| `test_env/tests/test_sandbox_*.py`, `test_usecases_u1_u4.py`, `test_run_archive.py`, `test_spec_method_trace.py` | Reference sandbox, archive, scenario, and method qualification |
| `test_env/tests/helpers_*.py`, `run_archive.py`, `sandbox_runtime.py`, `run_tests` | Python tenant qualification harness support |

## Codex Comparison Qualification Surfaces

These remain local to the paused comparison tenant.

| Surface family | Reason |
| --- | --- |
| `build_tenants/abiogenesis/codex/tests/` | Comparison reference only, not the released qualification lane |

## Migration Rule

During this migration phase:

- classify before moving
- preserve the paused Python reference qualification evidence without treating
  it as an active RC gate
- avoid inventing a shared executable test root before a second active tenant actually needs it
