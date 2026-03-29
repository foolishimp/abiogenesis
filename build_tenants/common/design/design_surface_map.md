# Abiogenesis Shared Design Surface Map

**Status**: Active
**Date**: 2026-03-29
**Derived from**: [GTL_2_CONSTITUTIONAL_DESIGN.md](/Users/jim/src/apps/abiogenesis/specification/GTL_2_CONSTITUTIONAL_DESIGN.md), [specification/requirements/](/Users/jim/src/apps/abiogenesis/specification/requirements/), [build_tenants/common/design/module_decomp.md](/Users/jim/src/apps/abiogenesis/build_tenants/common/design/module_decomp.md), [build_tenants/abiogenesis/python/design/README.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/README.md), [build_tenants/abiogenesis/codex/design/README.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/codex/design/README.md)

## Purpose

Make the current shared-vs-tenant design boundary explicit during the `abiogenesis` migration to `gsdlc 1.0`.

This document is structural only.
It does not change runtime behavior, installer output, or product semantics.

## Classification Rules

- `specification/` remains constitutional truth.
- `build_tenants/common/design/` holds tenant-local design law that is genuinely shared across realizations.
- `build_tenants/abiogenesis/<variant>/design/` holds realization-specific design detail, qualification material, and migration-local working surfaces.
- Promote a surface to `common` only when:
  - it is written generically enough to govern more than one realization, and
  - its authority no longer depends on one tenant's local implementation wording.

## Current Shared Tenant-Local Design Law

| Surface | Status | Why it is shared |
| --- | --- | --- |
| `build_tenants/common/design/module_decomp.md` | Active | Shared module ownership and decomposition for the current `abiogenesis` stack |
| `build_tenants/common/design/modules/` | Active | Shared module-level requirement ownership and primary surface map |

These surfaces are already shared law for:

- `REQ-L-GTL2-MODULE`
- `REQ-L-GTL2-ENGINE-INDEPENDENCE`
- `REQ-R-ABG2-SELFHOSTING`
- `REQ-P-QUAL`
- `REQ-M-GTL2-MAPPING`

## Canonical Shared-Candidate Surfaces Still Held In Python

These are currently treated as the canonical detailed design read for the released Python realization, but are not yet promoted into `common`.

| Surface | Current location | Why not yet promoted |
| --- | --- | --- |
| `GTL_2_MODULE_DESIGN.md` | `build_tenants/abiogenesis/python/design/` | Still written as the python build's detailed decomposition and ADR-dependent implementation read |
| `GTL_2_INTERFACE_CONTRACTS.md` | `build_tenants/abiogenesis/python/design/` | Current test/code derivation surface for the python tenant; not yet exercised as unchanged law by another active tenant |

Promotion trigger:

- a second active realization consumes the same surface unchanged, or
- the surface is rewritten to remove python-specific realization framing while preserving authority.

## Python-Tenant Realization Surfaces

These remain tenant-local by design.

| Surface family | Reason |
| --- | --- |
| `GTL_2_IMPLEMENTATION_PLAN.md` | Implementation-target read for the canonical python realization |
| `SCENARIO_V2_*.md` | Python tenant sandbox and qualification scenarios |
| `GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md` | Python tenant qualification ladder |
| `adrs/ADR-022`, `ADR-023`, `ADR-024`, `ADR-030` | Python realization decisions and shipping runtime details |

## Codex Comparison Surfaces

These remain local to the paused comparison tenant.

| Surface family | Reason |
| --- | --- |
| `build_tenants/abiogenesis/codex/design/GTL_2_MODULE_DESIGN.md` | Historical comparison and migration reference, not shared law |
| `build_tenants/abiogenesis/codex/design/adrs/ADR-002-job-role-worker-worksurface.md` | Codex-local design decision surface |

## Migration Rule

During this migration phase:

- prefer explicit classification over premature movement
- move a surface only when its shared authority is clear
- keep behavior stable while the design boundary is normalized
